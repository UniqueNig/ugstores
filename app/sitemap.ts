import type { MetadataRoute } from "next";
import type { Types } from "mongoose";
import { connectDB } from "@/src/lib/db";
import productModel from "@/src/models/Product";
import categoryModel from "@/src/models/Category";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type SitemapRow = {
  _id: Types.ObjectId;
  slug?: string | null;
  updatedAt?: Date;
};

/**
 * Generates /sitemap.xml — the list of URLs we want search engines to crawl.
 * Includes static pages plus every product and category, built from the DB.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/categories",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/shipping-returns",
    "/search",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
  }));

  try {
    await connectDB();

    const [products, categories] = await Promise.all([
      productModel.find().select("slug updatedAt").lean<SitemapRow[]>(),
      categoryModel.find().select("slug updatedAt").lean<SitemapRow[]>(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${siteUrl}/product/${p.slug ?? p._id.toString()}`,
      lastModified: p.updatedAt,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${siteUrl}/categories/${c.slug}`,
        lastModified: c.updatedAt,
      }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    // If the DB is unreachable at build time, still return the static pages.
    return staticRoutes;
  }
}
