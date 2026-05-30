import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/src/lib/db";
import productModel from "@/src/models/Product";
// Importing the Category model ensures Mongoose has it registered before
// we call .populate("category") on the server.
import "@/src/models/Category";

/**
 * Plain, serializable shape we hand to Server Components / generateMetadata.
 * (Mongoose documents aren't directly serializable across the server/client
 * boundary, so we map to a clean object.)
 */
export type ProductDetail = {
  id: string;
  name: string;
  slug: string | null;
  description: string;
  price: number;
  image: string | null;
  images: string[];
  stock: number;
  isNew: boolean;
  sizes: string[];
  sizeStock: { size: string; stock: number }[];
  colors: { name: string; hex: string; images: string[] }[];
  sizeGuide: string;
  materials: string;
  sizingFit: string;
  careInstructions: string;
  category: { id: string; name: string; slug: string } | null;
};

/**
 * Fetch a single product for the public product page — on the server.
 *
 * Accepts a slug OR an old Mongo id (so existing /product/<id> links keep
 * working). Returns null when nothing matches, which lets the page call
 * Next's notFound() for a proper 404.
 */
export async function getProductBySlug(
  slugOrId: string,
): Promise<ProductDetail | null> {
  await connectDB();

  let doc = await productModel.findOne({ slug: slugOrId }).populate("category");

  if (!doc && mongoose.isValidObjectId(slugOrId)) {
    doc = await productModel.findById(slugOrId).populate("category");
  }

  if (!doc) return null;

  const cat = doc.category as
    | { _id: mongoose.Types.ObjectId; name?: string; slug?: string }
    | null;

  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug ?? null,
    description: doc.description,
    price: doc.price,
    image: doc.image ?? null,
    images:
      Array.isArray(doc.images) && doc.images.length
        ? doc.images
        : doc.image
          ? [doc.image]
          : [],
    stock: doc.stock,
    isNew: Boolean(doc.isNew),
    sizes: Array.isArray(doc.sizes) ? doc.sizes : [],
    sizeStock: Array.isArray(doc.sizeStock)
      ? doc.sizeStock.map((s: any) => ({ size: s.size, stock: s.stock ?? 0 }))
      : [],
    colors: Array.isArray(doc.colors)
      ? doc.colors.map((c: any) => ({
          name: c.name,
          hex: c.hex ?? "",
          images: Array.isArray(c.images) ? c.images : [],
        }))
      : [],
    sizeGuide: doc.sizeGuide ?? "clothing",
    materials: doc.materials ?? "",
    sizingFit: doc.sizingFit ?? "",
    careInstructions: doc.careInstructions ?? "",
    category:
      cat && cat.name
        ? { id: cat._id.toString(), name: cat.name, slug: cat.slug ?? "" }
        : null,
  };
}

export type RelatedProduct = {
  id: string;
  slug: string | null;
  name: string;
  price: number;
  image: string | null;
  isNew: boolean;
  stock: number;
  sizes: string[];
};

/** Other products in the same category (for "You may also like"). */
export async function getRelatedProducts(
  categoryId: string | null,
  excludeId: string,
  limit = 4,
): Promise<RelatedProduct[]> {
  if (!categoryId) return [];
  await connectDB();
  const docs = await productModel
    .find({ category: categoryId, _id: { $ne: excludeId } })
    .sort({ _id: -1 })
    .limit(limit)
    .lean();
  return docs.map((p: any) => ({
    id: p._id.toString(),
    slug: p.slug ?? null,
    name: p.name,
    price: p.price,
    image: p.image ?? null,
    isNew: Boolean(p.isNew),
    stock: p.stock ?? 0,
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
  }));
}
