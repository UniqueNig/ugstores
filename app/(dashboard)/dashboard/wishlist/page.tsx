"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { useWishlist } from "@/src/context/WishlistContext";
import { useCart } from "@/src/context/CartContext";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          My Wishlist
        </h1>
        <p
          className="text-sm font-['DM_Sans'] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Heart size={48} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            Your wishlist is empty.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl overflow-hidden"
            >
              <Link
                href={`/product/${item.slug ?? item.id}`}
                className="relative block aspect-4/5 overflow-hidden"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </Link>
              <div className="p-4 space-y-3">
                <div>
                  {item.category && (
                    <p
                      className="text-[10px] tracking-widest uppercase font-['DM_Sans']"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.category}
                    </p>
                  )}
                  <Link href={`/product/${item.slug ?? item.id}`}>
                    <h3
                      className="text-sm font-bold font-['DM_Sans'] hover:opacity-70 transition-opacity"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.name}
                    </h3>
                  </Link>
                  <p
                    className="text-base font-black font-['Playfair_Display'] mt-1"
                    style={{ color: "var(--accent)" }}
                  >
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        category: item.category,
                        size: "One Size",
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label="Remove from wishlist"
                    className="w-10 flex items-center justify-center rounded-full border hover:opacity-70 transition-opacity"
                    style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
