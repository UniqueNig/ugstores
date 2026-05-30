"use client";

import { useCart } from "@/src/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCoupon } from "@/src/context/CouponContext";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart();
  const { coupon, apply, clear, refresh } = useCoupon();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);

  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount); // shipping is added at checkout

  // Re-check the applied coupon whenever the cart subtotal changes
  // (e.g. quantity edits may drop it below a minimum).
  useEffect(() => {
    if (coupon) refresh(subtotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setApplying(true);
    await apply(code.trim(), subtotal);
    setApplying(false);
  };

  if (items.length === 0) {
    return (
      <main
        style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}
      >
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
          <ShoppingBag size={64} style={{ color: "var(--text-muted)" }} />
          <h2
            className="text-3xl font-black font-['Playfair_Display']"
            style={{ color: "var(--text-primary)" }}
          >
            Your cart is empty
          </h2>
          <p
            className="text-sm font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            Looks like you haven't added anything yet.
          </p>
          <Link
            href="/shop"
            className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
          >
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1
              className="text-4xl md:text-5xl font-black font-['Playfair_Display']"
              style={{ color: "var(--text-primary)" }}
            >
              Your Cart
            </h1>
            <p
              className="text-sm font-['DM_Sans'] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase font-['DM_Sans'] transition-opacity hover:opacity-60"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={13} /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
          {/* Items */}
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color ?? ""}`}
                className="flex gap-5 py-6 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="relative w-24 h-28 md:w-28 md:h-36 shrink-0 overflow-hidden rounded-2xl"
                  style={{ backgroundColor: "var(--card-bg)" }}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: "var(--card-bg)" }}
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {item.category && (
                        <p
                          className="text-[10px] tracking-widest uppercase font-['DM_Sans']"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.category}
                        </p>
                      )}
                      <h3
                        className="text-base font-bold font-['DM_Sans'] mt-0.5"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name}
                      </h3>
                      {(item.size || item.color) && (
                        <p
                          className="text-xs font-['DM_Sans'] mt-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {[item.color && `Colour: ${item.color}`, item.size && `Size: ${item.size}`]
                            .filter(Boolean)
                            .join("  ·  ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="transition-opacity hover:opacity-60 flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div
                      className="inline-flex items-center rounded-full overflow-hidden border"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <button
                        onClick={() => updateQty(item.id, item.size, -1, item.color)}
                        className="w-8 h-8 flex items-center justify-center hover:opacity-60 transition-opacity"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className="w-8 text-center text-sm font-bold font-['DM_Sans'] border-x"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.size, 1, item.color)}
                        disabled={
                          !!item.maxStock && item.quantity >= item.maxStock
                        }
                        className="w-8 h-8 flex items-center justify-center hover:opacity-60 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className="font-black font-['Playfair_Display'] text-lg"
                        style={{ color: "var(--accent)" }}
                      >
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                      {!!item.maxStock && item.quantity >= item.maxStock && (
                        <span
                          className="text-[10px] font-['DM_Sans'] mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Max stock reached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass-strong rounded-3xl p-6 space-y-5 sticky top-28 self-start">
            <h2
              className="text-sm font-bold tracking-widest uppercase font-['DM_Sans']"
              style={{ color: "var(--text-primary)" }}
            >
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                  Subtotal
                </span>
                <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                    Discount {coupon?.code ? `(${coupon.code})` : ""}
                  </span>
                  <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--accent-2)" }}>
                    -₦{discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                  Shipping
                </span>
                <span className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                  Calculated at checkout
                </span>
              </div>
            </div>
            <div
              className="border-t pt-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex justify-between">
                <span
                  className="font-bold font-['DM_Sans']"
                  style={{ color: "var(--text-primary)" }}
                >
                  Total
                </span>
                <span
                  className="text-xl font-black font-['Playfair_Display']"
                  style={{ color: "var(--accent)" }}
                >
                  ₦{total.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>
                Plus shipping, selected at checkout.
              </p>
            </div>
            {coupon ? (
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-full border"
                style={{ borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)" }}
              >
                <span className="text-xs font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>
                  {coupon.code} applied
                </span>
                <button
                  onClick={() => { clear(); setCode(""); }}
                  className="text-[10px] font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 px-4 py-2.5 rounded-full text-xs font-['DM_Sans'] outline-none border uppercase"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  onClick={applyCoupon}
                  disabled={applying || !code.trim()}
                  className="px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
                >
                  {applying ? "..." : "Apply"}
                </button>
              </div>
            )}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
            >
              Proceed to Checkout <ArrowRight size={14} />
            </Link>
            <div className="flex items-center justify-center gap-4 pt-2">
              {["🔒 Secure", "✓ Authentic", "↩ Easy Returns"].map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-['DM_Sans']"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
