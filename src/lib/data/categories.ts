import "server-only";
import { connectDB } from "@/src/lib/db";
import categoryModel from "@/src/models/Category";
import productModel from "@/src/models/Product";

export type CategoryCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string | null; // representative image (first product in the category)
};

export type CategoryProduct = {
  id: string;
  slug: string | null;
  name: string;
  price: number;
  image: string | null;
  isNew: boolean;
  stock: number;
  sizes: string[];
};

/**
 * All categories with a live product count and a representative image,
 * for the /categories listing page.
 */
export async function getAllCategories(): Promise<CategoryCard[]> {
  await connectDB();

  const categories = await categoryModel.find().sort({ name: 1 }).lean();

  return Promise.all(
    categories.map(async (cat: any) => {
      const id = cat._id.toString();
      const [count, firstProduct] = await Promise.all([
        productModel.countDocuments({ category: cat._id }),
        productModel
          .findOne({ category: cat._id, image: { $nin: [null, ""] } })
          .select("image")
          .lean(),
      ]);

      return {
        id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? "",
        productCount: count,
        image: (firstProduct as any)?.image ?? null,
      };
    }),
  );
}

/** A single category by slug (or null). */
export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryCard | null> {
  await connectDB();

  const cat: any = await categoryModel.findOne({ slug }).lean();
  if (!cat) return null;

  const count = await productModel.countDocuments({ category: cat._id });

  return {
    id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? "",
    productCount: count,
    image: null,
  };
}

/** All products inside a category, by the category slug. */
export async function getProductsByCategorySlug(
  slug: string,
): Promise<CategoryProduct[]> {
  await connectDB();

  const cat: any = await categoryModel.findOne({ slug }).select("_id").lean();
  if (!cat) return [];

  const products = await productModel
    .find({ category: cat._id })
    .sort({ _id: -1 })
    .lean();

  return products.map((p: any) => ({
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
