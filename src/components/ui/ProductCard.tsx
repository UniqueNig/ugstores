"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";

type ProductCardProps = {
  id: string;
  slug?: string; // SEO URL; falls back to id if missing
  name: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  stock?: number;
  sizes?: string[];
};

export default function ProductCard({
  id,
  slug,
  name,
  price,
  image,
  category,
  isNew,
  stock,
  sizes,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = useState(false);

  const wishlisted = has(id);

  // Treat "no stock info" as available (e.g. legacy callers); only block on 0.
  const soldOut = stock !== undefined && stock <= 0;
  // Products with size options must be opened to pick a size first.
  const hasSizes = !!sizes && sizes.length > 0;
  const href = `/product/${slug ?? id}`;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({ id, slug, name, price, image, category });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (soldOut) return;
    // Products on grid don't have size selection — default to "One Size"
    // For sized items, clicking the card goes to product page where size is chosen
    addItem({ id, name, price, image, category, size: "One Size", maxStock: stock });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group relative transition-transform duration-300 hover:-translate-y-1">
      {/* Image container */}
      <div
        className="relative overflow-hidden rounded-2xl aspect-3/4 mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-300"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        {/* Whole image links to the product (sits under the action overlay) */}
        <Link href={`/product/${slug ?? id}`} aria-label={name} className="absolute inset-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: "var(--bg-secondary)" }} />
          )}
        </Link>

        {/* Overlay actions — buttons capture clicks; empty areas fall through to the image link */}
        <div className="absolute inset-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-3 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none">
          {!soldOut && hasSizes ? (
            // Has size options → must choose on the product page
            <Link
              href={href}
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors font-['DM_Sans']"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
            >
              <ShoppingBag size={13} /> Select Options
            </Link>
          ) : (
          <button
            onClick={handleAddToCart}
            disabled={soldOut}
            className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors font-['DM_Sans'] disabled:cursor-not-allowed"
            style={{
              backgroundColor: soldOut
                ? "var(--text-muted)"
                : added
                  ? "var(--accent-2)"
                  : "var(--accent)",
              color: added ? "#fff" : "#16240f",
            }}
          >
            {soldOut ? (
              "Sold Out"
            ) : added ? (
              <>
                <Check size={13} /> Added!
              </>
            ) : (
              <>
                <ShoppingBag size={13} /> Add to Cart
              </>
            )}
          </button>
          )}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="pointer-events-auto w-10 h-10 rounded-full border border-white/40 hover:border-white flex items-center justify-center transition-colors backdrop-blur-md bg-white/10"
            style={{ color: wishlisted ? "var(--accent)" : "#fff" }}
          >
            <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Badge */}
        {soldOut ? (
          <div
            className="absolute top-3 left-3 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
            style={{ backgroundColor: "#ef4444" }}
          >
            Sold Out
          </div>
        ) : (
          isNew && (
            <div
              className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
            >
              New
            </div>
          )
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[10px] tracking-widest uppercase mb-1 font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            {category}
          </p>
          <Link href={`/product/${slug ?? id}`}>
            <h3
              className="text-sm font-medium font-['DM_Sans'] transition-colors hover:opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </h3>
          </Link>
        </div>
        <span
          className="font-bold font-['Playfair_Display'] text-sm"
          style={{ color: "var(--accent)" }}
        >
          ₦{price.toLocaleString()}
        </span>
      </div>
    </div>
  );
}