"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, ArrowLeft, ArrowRight, Check } from "lucide-react";
// At the top of ShopGrid.tsx
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { useState } from "react";

type Product = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  category: {
    name: string;
    slug: string;
  };
  isNew?: boolean;
  stock?: number;
  sizes?: string[];
};

type ShopGridProps = {
  products: Product[];
  view: "grid" | "list";
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
};

// Add this hook above GridCard
function useAddFeedback() {
  const [added, setAdded] = useState(false);

  const trigger = (callback: () => void) => {
    callback();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return { added, trigger };
}

function GridCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const { added, trigger } = useAddFeedback();
  const { has, toggle } = useWishlist();
  const soldOut = product.stock !== undefined && product.stock <= 0;
  const wishlisted = has(product.id);
  const hasSizes = (product.sizes?.length ?? 0) > 0;
  const href = `/product/${product.slug ?? product.id}`;

  return (
    <div className="group relative transition-transform duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-2xl aspect-5/7 mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: "var(--card-bg)" }}>
        <Link href={`/product/${product.slug ?? product.id}`} aria-label={product.name} className="absolute inset-0">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: "var(--bg-secondary)" }} />
          )}
        </Link>

        <div className="absolute inset-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5 gap-2 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none">
          {!soldOut && hasSizes ? (
            <Link
              href={href}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
            >
              <ShoppingBag size={12} /> Select Options
            </Link>
          ) : (
            <button
              onClick={() => !soldOut && trigger(onAddToCart)}
              disabled={soldOut}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 disabled:cursor-not-allowed"
              style={{
                backgroundColor: soldOut ? "var(--text-muted)" : added ? "var(--accent-2)" : "var(--accent)",
                color: added ? "#fff" : "#16240f",
              }}
            >
              {soldOut ? "Sold Out" : added ? <><Check size={12} /> Added!</> : <><ShoppingBag size={12} /> Add to Cart</>}
            </button>
          )}
          <button
            onClick={() =>
              toggle({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image ?? null,
                category: product.category?.name ?? "",
              })
            }
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="pointer-events-auto w-9 h-9 rounded-full border border-white/40 hover:border-white flex items-center justify-center transition-colors backdrop-blur-md bg-white/10"
            style={{ color: wishlisted ? "var(--accent)" : "#fff" }}
          >
            <Heart size={13} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {soldOut ? (
          <div className="absolute top-3 left-3 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
            style={{ backgroundColor: "#ef4444" }}>
            Sold Out
          </div>
        ) : product.isNew ? (
          <div className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
            New
          </div>
        ) : null}
      </div>
      {/* Info unchanged */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-1 font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            {product.category?.name}
          </p>
          <Link href={`/product/${product.slug ?? product.id}`}>
            <h3 className="text-sm font-medium font-['DM_Sans'] transition-colors hover:opacity-70" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h3>
          </Link>
        </div>
        <span className="font-bold font-['Playfair_Display'] text-sm" style={{ color: "var(--accent)" }}>
          ₦{product.price.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function ListCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const { added, trigger } = useAddFeedback();
  const soldOut = product.stock !== undefined && product.stock <= 0;
  const hasSizes = (product.sizes?.length ?? 0) > 0;
  const href = `/product/${product.slug ?? product.id}`;

  return (
    <div className="flex gap-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
      <Link href={`/product/${product.slug ?? product.id}`} aria-label={product.name} className="relative overflow-hidden rounded-xl w-24 h-32 shrink-0" style={{ backgroundColor: "var(--card-bg)" }}>
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
        {soldOut ? (
          <div className="absolute top-2 left-2 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full font-['DM_Sans']"
            style={{ backgroundColor: "#ef4444" }}>
            Sold Out
          </div>
        ) : product.isNew ? (
          <div className="absolute top-2 left-2 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full font-['DM_Sans']"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
            New
          </div>
        ) : null}
      </Link>
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-1 font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            {product.category?.name}
          </p>
          <Link href={`/product/${product.slug ?? product.id}`}>
            <h3 className="text-base font-medium font-['DM_Sans'] mb-1 hover:opacity-70 transition-opacity" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h3>
          </Link>
          <span className="font-bold font-['Playfair_Display']" style={{ color: "var(--accent)" }}>
            ₦{product.price.toLocaleString()}
          </span>
        </div>
        {!soldOut && hasSizes ? (
          <Link
            href={href}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 hover:opacity-80"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
          >
            <ShoppingBag size={12} /> Select Options
          </Link>
        ) : (
          <button
            onClick={() => !soldOut && trigger(onAddToCart)}
            disabled={soldOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 hover:opacity-80 disabled:cursor-not-allowed"
            style={{
              backgroundColor: soldOut ? "var(--text-muted)" : added ? "var(--accent-2)" : "var(--accent)",
              color: added ? "#fff" : "#16240f",
            }}
          >
            {soldOut ? "Sold Out" : added ? <><Check size={12} /> Added!</> : <><ShoppingBag size={12} /> Add</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ShopGrid({
  products,
  view,
  currentPage,
  totalPages,
  onPageChange,
}: ShopGridProps) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p
          className="text-4xl mb-4 font-['Playfair_Display'] font-black"
          style={{ color: "var(--text-muted)" }}
        >
          No products found
        </p>
        <p
          className="text-sm font-['DM_Sans']"
          style={{ color: "var(--text-muted)" }}
        >
          Try adjusting your filters
        </p>
      </div>
    );
  }

  const handleAdd = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image ?? null, // ← guards against empty string
      category: product.category?.name ?? "",
      quantity: 1,
      size: "", // ← add this; no size selector on the grid
      maxStock: product.stock,
    });
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Grid or List */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {products.map((product) => (
            <GridCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAdd(product)}
            />
          ))}
        </div>
      ) : (
        <div>
          {products.map((product) => (
            <ListCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAdd(product)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-16">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-30"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <ArrowLeft size={14} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="w-9 h-9 flex items-center justify-center rounded-full border text-xs font-bold font-['DM_Sans'] transition-all duration-200"
            style={{
              backgroundColor:
                currentPage === page ? "var(--accent)" : "transparent",
              borderColor:
                currentPage === page ? "var(--accent)" : "var(--border)",
              color: currentPage === page ? "#16240f" : "var(--text-secondary)",
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-30"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
