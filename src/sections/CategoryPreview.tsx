import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getAllCategories } from "@/src/lib/data/categories";

// Bento layout pattern applied to the first few real categories.
const SPANS = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
];

export default async function CategoryPreview() {
  const all = await getAllCategories();
  const categories = all.slice(0, 4);

  // Nothing to show yet — skip the section entirely.
  if (categories.length === 0) return null;

  return (
    <section
      className="py-20 px-6 lg:px-10"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3 font-['DM_Sans']"
              style={{ color: "var(--accent)" }}
            >
              Browse By
            </p>
            <h2
              className="text-4xl md:text-5xl font-black font-['Playfair_Display']"
              style={{ color: "var(--text-primary)" }}
            >
              Categories
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase font-['DM_Sans'] group"
            style={{ color: "var(--text-secondary)" }}
          >
            View All
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 gap-3 md:gap-4 h-[500px] md:h-[600px]">
          {categories.map((cat, i) => {
            // Tiles auto-use a representative product photo once products exist.
            // Until then, fall back to an on-brand orange↔green gradient with a
            // big faded category initial — so empty categories still look designed.
            const brandGradient =
              i % 2 === 0
                ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                : "linear-gradient(135deg, var(--accent-2), var(--accent))";
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl ${SPANS[i] ?? "col-span-1 row-span-1"}`}
                style={{ backgroundColor: "var(--card-bg)" }}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                    style={{ background: brandGradient }}
                  >
                    {/* Big faded initial as a brand watermark */}
                    <span
                      className="absolute -right-3 -bottom-8 font-['Playfair_Display'] font-black leading-none select-none"
                      style={{ fontSize: "9rem", color: "rgba(255,255,255,0.16)" }}
                    >
                      {cat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Gradient overlay — heavier over photos for text legibility,
                    lighter over the brand gradient so the colour shows through. */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    cat.image ? "from-black/80 via-black/20" : "from-black/35 via-transparent"
                  } to-transparent`}
                />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white/70 text-[10px] tracking-widest uppercase mb-1 font-['DM_Sans']">
                    {cat.productCount} {cat.productCount === 1 ? "item" : "items"}
                  </p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold font-['Playfair_Display'] text-lg md:text-xl drop-shadow">
                      {cat.name}
                    </h3>
                    <ArrowRight
                      size={16}
                      className="text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
