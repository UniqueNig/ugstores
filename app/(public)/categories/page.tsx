import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { ArrowRight } from "lucide-react";
import { getAllCategories } from "@/src/lib/data/categories";
import { siteConfig } from "@/src/config/site";

// Refresh category data at most once a minute (reflects admin changes).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop by Category",
  description: `Browse all product categories at ${siteConfig.legalName} and find exactly what you're looking for.`,
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div className="pt-36 pb-12 px-6 lg:px-10 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase font-['DM_Sans'] mb-3" style={{ color: "var(--accent)" }}>Browse By</p>
          <h1 className="text-5xl md:text-6xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Categories</h1>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-muted)" }}>
              No categories yet
            </p>
            <Link href="/shop" className="text-xs font-bold tracking-widest uppercase font-['DM_Sans'] underline underline-offset-4" style={{ color: "var(--accent)" }}>
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              // Auto-uses a representative product photo once products exist;
              // until then an on-brand orange↔green gradient with a faded initial.
              const brandGradient =
                i % 2 === 0
                  ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                  : "linear-gradient(135deg, var(--accent-2), var(--accent))";
              return (
                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group relative overflow-hidden rounded-2xl aspect-4/3 block" style={{ backgroundColor: "var(--card-bg)" }}>
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                      style={{ background: brandGradient }}
                    >
                      <span
                        className="absolute -right-3 -bottom-8 font-['Playfair_Display'] font-black leading-none select-none"
                        style={{ fontSize: "9rem", color: "rgba(255,255,255,0.16)" }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      cat.image ? "from-black/80 via-black/20" : "from-black/35 via-transparent"
                    } to-transparent`}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white/70 text-[10px] tracking-widest uppercase font-['DM_Sans'] mb-1">
                      {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <h2 className="text-white text-2xl font-black font-['Playfair_Display'] drop-shadow">{cat.name}</h2>
                        {cat.description && (
                          <p className="text-white/70 text-xs font-['DM_Sans'] mt-1">{cat.description}</p>
                        )}
                      </div>
                      <ArrowRight size={18} className="text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0 mb-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
