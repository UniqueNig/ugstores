import { connectDB } from "@/src/lib/db";
import categoryModel from "@/src/models/Category";
import productModel from "@/src/models/Product";
import mongoose from "mongoose";
import { makeUniqueSlug, slugify } from "@/src/lib/slug";
import { diffRestock, fulfillStockAlerts } from "@/src/lib/stockAlerts";

// Escape any regex-special characters so a product name can be used safely
// inside a `new RegExp(...)` (e.g. a name with "(" won't break the query).
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Produce a slug that is guaranteed unique across the products collection.
 * - `desired` is the raw text to slugify (the admin's slug input, or the name).
 * - `excludeId` lets an edit ignore the product's own current slug, so
 *   re-saving without changing the slug doesn't trip the uniqueness check.
 */
async function generateUniqueProductSlug(
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(desired) || "product";

  // Find every existing slug shaped like "base" or "base-2", "base-3", ...
  const regex = new RegExp(`^${escapeRegex(base)}(-\\d+)?$`, "i");
  const query: Record<string, unknown> = { slug: regex };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await productModel.find(query).select("slug").lean();
  const taken = existing
    .map((d: any) => d.slug)
    .filter((s: unknown): s is string => typeof s === "string");

  return makeUniqueSlug(base, taken);
}

// Keep derived fields consistent: when a product is sized, the total `stock`
// and the simple `sizes` list are computed from sizeStock; `image` mirrors the
// first gallery image. Mutates and returns the same object.
function deriveVariantFields(data: any) {
  if (Array.isArray(data.sizeStock) && data.sizeStock.length > 0) {
    data.stock = data.sizeStock.reduce(
      (sum: number, s: any) => sum + (Number(s.stock) || 0),
      0,
    );
    data.sizes = data.sizeStock.map((s: any) => s.size);
  }
  if (Array.isArray(data.images) && data.images.length > 0) {
    data.image = data.images[0];
  }
  return data;
}

export const productResolvers = {
  Product: {
    id: (parent: any) => parent._id?.toString() ?? parent.id,
    slug: (parent: any) => parent.slug ?? null,
    category: (parent: any) => {
      const cat = parent.category;
      if (!cat) return null;
      // if it's just an ObjectId (not populated), return null
      if (!cat.name) return null;
      return {
        id: cat._id?.toString() ?? cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? null,
        productCount: cat.productCount ?? 0,
      };
    },
  },

  Query: {
    products: async () => {
      await connectDB();

      try {
        const products = await productModel.find().sort({ _id: -1 }).populate("category");
        // ✅ filter out products with broken category refs
        return products.filter((p) => p.category != null);
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch products");
      }
    },

    // ✅ Paginated + server-filtered listing for the shop & search pages.
    // Filtering, sorting, and paging happen in MongoDB so the client never
    // downloads the whole catalog.
    productsPage: async (
      _: unknown,
      {
        filter = {},
        page = 1,
        limit = 12,
      }: {
        filter?: {
          search?: string;
          category?: string;
          minPrice?: number;
          maxPrice?: number;
          sizes?: string[];
          sort?: string;
        };
        page?: number;
        limit?: number;
      },
    ) => {
      await connectDB();

      const safePage = Math.max(1, Math.floor(page || 1));
      const safeLimit = Math.min(60, Math.max(1, Math.floor(limit || 12)));

      // Only consider products whose category still exists (mirrors the old
      // products query that filtered out broken refs — and keeps counts honest).
      const validCats = await categoryModel.find().select("_id name slug").lean();
      const validCatIds = validCats.map((c: any) => c._id);

      const query: Record<string, unknown> = { category: { $in: validCatIds } };

      // Category by slug.
      if (filter.category && filter.category !== "all") {
        const cat = validCats.find((c: any) => c.slug === filter.category);
        // Unknown slug → no results (rather than silently ignoring the filter).
        query.category = cat ? cat._id : { $in: [] };
      }

      // Text search across product name OR category name.
      if (filter.search && filter.search.trim()) {
        const rx = new RegExp(escapeRegex(filter.search.trim()), "i");
        const matchedCatIds = validCats
          .filter((c: any) => rx.test(c.name ?? ""))
          .map((c: any) => c._id);
        const baseCat = query.category; // preserve the category constraint
        query.$and = [
          { category: baseCat },
          { $or: [{ name: rx }, { category: { $in: matchedCatIds } }] },
        ];
        delete query.category;
      }

      // Price range.
      if (typeof filter.minPrice === "number" || typeof filter.maxPrice === "number") {
        const price: Record<string, number> = {};
        if (typeof filter.minPrice === "number") price.$gte = filter.minPrice;
        if (typeof filter.maxPrice === "number") price.$lte = filter.maxPrice;
        query.price = price;
      }

      // Sizes: keep products offering any of the selected sizes.
      if (Array.isArray(filter.sizes) && filter.sizes.length > 0) {
        query.sizes = { $in: filter.sizes };
      }

      // Sort.
      let sort: Record<string, 1 | -1>;
      switch (filter.sort) {
        case "price-asc":
          sort = { price: 1 };
          break;
        case "price-desc":
          sort = { price: -1 };
          break;
        default: // "newest"
          sort = { isNew: -1, _id: -1 };
      }

      const total = await productModel.countDocuments(query);
      const items = await productModel
        .find(query)
        .sort(sort)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .populate("category");

      return {
        items,
        total,
        page: safePage,
        pages: Math.max(1, Math.ceil(total / safeLimit)),
      };
    },

    product: async (_: unknown, { id }: { id: string }) => {
      await connectDB();

      const product = await productModel.findById(id).populate("category");

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    },

    // ✅ Pre-checkout availability check.
    checkStock: async (
      _: unknown,
      { items }: { items: Array<{ product: string; quantity: number; size?: string }> },
    ) => {
      await connectDB();

      const ids = items.map((i) => i.product);
      const products = await productModel
        .find({ _id: { $in: ids } })
        .select("name stock sizeStock")
        .lean();

      const byId = new Map(products.map((p: any) => [p._id.toString(), p]));

      return items.map((i) => {
        const p: any = byId.get(i.product);
        // If the product is sized and a size was chosen, check THAT size's stock.
        let available = p?.stock ?? 0;
        if (p?.sizeStock?.length && i.size) {
          const row = p.sizeStock.find((s: any) => s.size === i.size);
          available = row?.stock ?? 0;
        }
        return {
          product: i.product,
          name: p?.name ?? null,
          available,
          requested: i.quantity,
          ok: available >= i.quantity,
        };
      });
    },

    // ✅ Public product page lookup by slug, with id fallback.
    // New URLs are /product/<slug>; old /product/<mongoId> links still resolve.
    productBySlug: async (_: unknown, { slug }: { slug: string }) => {
      await connectDB();

      let product = await productModel.findOne({ slug }).populate("category");

      // Fallback: the value looks like a Mongo ObjectId (an old-style link)
      if (!product && mongoose.isValidObjectId(slug)) {
        product = await productModel.findById(slug).populate("category");
      }

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    },
  },

  Mutation: {
    // ✅ CREATE PRODUCT (ADMIN)
    createProduct: async (_: unknown, args: any, context: any) => {
      await connectDB();

      // 🔒 Protect route
      if (
        !context.user ||
        !["admin", "superadmin"].includes(context.user.role)
      ) {
        throw new Error("Unauthorized");
      }

      // Use the admin-provided slug if present, otherwise derive from the name.
      // Either way we run it through the uniqueness guard.
      const slug = await generateUniqueProductSlug(args.slug || args.name);

      const newProduct = await productModel.create(
        deriveVariantFields({
          ...args,
          slug,
          createdBy: context.user?.id,
        }),
      );

      return await newProduct.populate("category");
    },

    // ✅ UPDATE PRODUCT
    updateProduct: async (_: unknown, { id, ...rest }: any, context: any) => {
      await connectDB();

      if (
        !context.user ||
        !["admin", "superadmin"].includes(context.user.role)
      ) {
        throw new Error("Unauthorized");
      }

      // ✅ Validate category if provided
      if (rest.category) {
        const exists = await categoryModel.findById(rest.category);
        if (!exists) {
          throw new Error("Invalid category");
        }
      }

      // Only update the fields that were actually sent.
      const updates: Record<string, unknown> = {};
      for (const key of [
        "name",
        "description",
        "price",
        "image",
        "images",
        "stock",
        "category",
        "isNew",
        "sizes",
        "sizeStock",
        "colors",
        "sizeGuide",
        "materials",
        "sizingFit",
        "careInstructions",
      ]) {
        if (rest[key] !== undefined) updates[key] = rest[key];
      }

      // Keep stock/sizes/image in sync with sizeStock & images.
      deriveVariantFields(updates);

      // Slug only changes when the admin explicitly provides one, so existing
      // SEO URLs aren't silently broken on every edit.
      if (rest.slug !== undefined && rest.slug !== "") {
        updates.slug = await generateUniqueProductSlug(rest.slug, id);
      }

      // Snapshot stock BEFORE the update so we can detect a 0 → in-stock
      // transition and notify back-in-stock waiters.
      const before: any = await productModel
        .findById(id)
        .select("stock sizeStock")
        .lean();

      const updatedProduct = await productModel
        .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("category");

      if (!updatedProduct) {
        throw new Error("Product not found");
      }

      // Fire back-in-stock emails for anything that just came back. Awaited
      // (serverless drops un-awaited promises) but isolated — must never break
      // the save.
      if (before) {
        try {
          const restock = diffRestock(
            { stock: before.stock, sizeStock: before.sizeStock },
            { stock: updatedProduct.stock, sizeStock: updatedProduct.sizeStock },
          );
          await fulfillStockAlerts(id, restock);
        } catch (e) {
          console.error("Back-in-stock notify failed:", e);
        }
      }

      return updatedProduct;
    },

    // ✅ DELETE PRODUCT
    deleteProduct: async (_: unknown, { id }: { id: string }, context: any) => {
      await connectDB();

      if (
        !context.user ||
        !["admin", "superadmin"].includes(context.user.role)
      ) {
        throw new Error("Unauthorized");
      }

      const deleted = await productModel.findByIdAndDelete(id);

      if (!deleted) {
        throw new Error("Product not found");
      }

      return deleted;
    },

    // ✅ ONE-TIME BACKFILL (ADMIN): give every slug-less product a slug.
    backfillProductSlugs: async (_: unknown, __: unknown, context: any) => {
      await connectDB();

      if (
        !context.user ||
        !["admin", "superadmin"].includes(context.user.role)
      ) {
        throw new Error("Unauthorized");
      }

      // Products missing a slug
      const missing = await productModel.find({
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
      });

      // Slugs already in use (so we don't create duplicates)
      const withSlug = await productModel
        .find({ slug: { $nin: [null, ""] } })
        .select("slug")
        .lean();
      const taken = new Set(
        withSlug
          .map((d: any) => d.slug)
          .filter((s: unknown): s is string => typeof s === "string"),
      );

      let count = 0;
      for (const product of missing) {
        const slug = makeUniqueSlug(product.name, taken);
        product.slug = slug;
        taken.add(slug);
        await product.save();
        count++;
      }

      return count;
    },
  },
};
