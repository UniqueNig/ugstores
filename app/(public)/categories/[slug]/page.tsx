import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import ProductCard from "@/src/components/ui/ProductCard";
import { ArrowLeft } from "lucide-react";
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "@/src/lib/data/categories";
import { siteConfig } from "@/src/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Category not found" };

  const description =
    category.description ||
    `Shop ${category.name} at ${siteConfig.legalName} — ${category.productCount} product${category.productCount === 1 ? "" : "s"} available.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      type: "website",
      title: category.name,
      description,
      url: `/categories/${category.slug}`,
    },
  };
}

export default async function CategorySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategorySlug(slug);
  const heroImage = products.find((p) => p.image)?.image ?? null;

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden mt-16" style={{ backgroundColor: "var(--bg-secondary)" }}>
        {heroImage && (
          <Image src={heroImage} alt={category.name} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col justify-end px-6 lg:px-10 pb-10 max-w-7xl mx-auto">
          <Link href="/categories" className="flex items-center gap-2 text-white/60 text-xs tracking-widest uppercase font-['DM_Sans'] mb-4 hover:text-white transition-colors">
            <ArrowLeft size={12} /> All Categories
          </Link>
          <h1 className="text-5xl font-black font-['Playfair_Display'] text-white">{category.name}</h1>
          {category.description && (
            <p className="text-white/60 text-sm font-['DM_Sans'] mt-1">{category.description}</p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{products.length}</span>{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-muted)" }}>
              Nothing here yet
            </p>
            <Link href="/shop" className="text-xs font-bold tracking-widest uppercase font-['DM_Sans'] underline underline-offset-4" style={{ color: "var(--accent)" }}>
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug ?? undefined}
                name={product.name}
                price={product.price}
                image={product.image ?? ""}
                category={category.name}
                isNew={product.isNew}
                stock={product.stock}
                sizes={product.sizes}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
