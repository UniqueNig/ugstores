"use client";

import { useState } from "react";
import {
  ShoppingBag, Minus, Plus, Share2, Heart,
  Check, Truck, RefreshCw, Shield,
} from "lucide-react";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { useToast } from "@/src/context/ToastContext";
import SizeGuideModal from "@/src/features/products/components/SizeGuideModal";
import BackInStockForm from "@/src/features/products/components/BackInStockForm";

type ProductInfoProps = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  isNew?: boolean;
  inStock: boolean;
  stockCount?: number;
  sizes: string[];
  sizeStock?: { size: string; stock: number }[];
  sizeGuide?: "clothing" | "footwear" | "none";
  whatsappNumber: string;
  // Colour options (each with its own gallery images). Selection is owned by
  // the ProductDetailClient wrapper so the gallery can swap in sync.
  colors?: { name: string; hex: string; images: string[] }[];
  selectedColor?: string | null;
  onColorChange?: (name: string) => void;
};

const GUARANTEES = [
  { icon: Truck,      label: "Nationwide delivery", sub: "Southwest & beyond" },
  { icon: RefreshCw,  label: "48-hour returns",     sub: "On eligible items" },
  { icon: Shield,     label: "Secure checkout",     sub: "Protected by Paystack" },
];

export default function ProductInfo({
  id, slug, name, price, originalPrice, description, category, image,
  isNew, inStock, stockCount, sizes, sizeStock, sizeGuide = "clothing", whatsappNumber,
  colors, selectedColor, onColorChange,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const wishlisted = has(id);

  // Per-size inventory (if provided). Otherwise fall back to the simple sizes
  // list + shared stockCount.
  const sized = !!sizeStock && sizeStock.length > 0;
  const sizeList = sized ? sizeStock!.map((s) => s.size) : sizes;
  const stockForSize = (s: string) =>
    sizeStock?.find((x) => x.size === s)?.stock ?? 0;
  const selectedStock = sized
    ? selectedSize
      ? stockForSize(selectedSize)
      : 0
    : stockCount ?? 0;
  const anySizeAvailable = sized ? sizeStock!.some((s) => s.stock > 0) : inStock;
  // Colours, if any, must be picked before adding to cart.
  const colorList = colors ?? [];
  const hasColors = colorList.length > 0;
  const colorChosen = !hasColors || !!selectedColor;
  // Available to add: a chosen size must have stock; non-sized uses product
  // stock; and a colour must be chosen when colours exist.
  const canBuy =
    colorChosen && (sized ? !!selectedSize && selectedStock > 0 : inStock);
  const maxForQty = sized ? selectedStock : stockCount ?? 0;

  // Back-in-stock: show when the whole product is out, or when a chosen size is
  // sold out (while other sizes may still be available).
  const soldOutSelected = sized && !!selectedSize && selectedStock <= 0;
  const showNotify = !anySizeAvailable || soldOutSelected;
  const notifySize = soldOutSelected ? selectedSize! : "";

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    const size = selectedSize ?? (sizeList.length === 0 ? "One Size" : null);
    if (!size) return; // sizes exist but none selected
    if (hasColors && !selectedColor) return; // colours exist but none selected
    if (sized ? selectedStock <= 0 : !inStock) return;

    // Snapshot the colour's first image so the cart shows the right variant.
    const colorImage =
      colorList.find((c) => c.name === selectedColor)?.images[0] || null;

    addItem({
      id, name, price, image: colorImage ?? image ?? null, category, size,
      color: selectedColor ?? "", quantity,
      maxStock: sized ? selectedStock : stockCount,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in *${name}* (${selectedColor ? `Colour: ${selectedColor}, ` : ""}${selectedSize ? `Size: ${selectedSize}, ` : ""}Qty: ${quantity}) — ₦${price.toLocaleString()}. Can you help me with this order?`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard", "success");
      }
    } catch {
      // user cancelled the share sheet, or clipboard blocked — try clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard", "success");
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Top meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.25em] uppercase font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            {category}
          </span>
          {isNew && (
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full font-['DM_Sans']"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggle({ id, slug, name, price, image: image || null, category })}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200"
            style={{ borderColor: wishlisted ? "var(--accent)" : "var(--border)", color: wishlisted ? "var(--accent)" : "var(--text-muted)" }}>
            <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button onClick={handleShare}
            className="w-8 h-8 flex items-center justify-center border transition-all duration-200 hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Name */}
      <h1 className="text-3xl md:text-4xl font-black font-['Playfair_Display'] leading-tight"
        style={{ color: "var(--text-primary)" }}>
        {name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-4">
        <span className="text-3xl font-black font-['Playfair_Display']" style={{ color: "var(--accent)" }}>
          ₦{price.toLocaleString()}
        </span>
        {originalPrice && (
          <span className="text-lg line-through font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            ₦{originalPrice.toLocaleString()}
          </span>
        )}
        {discount && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full font-['DM_Sans']"
            style={{ backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>
            -{discount}%
          </span>
        )}
      </div>

      {/* Stock */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: anySizeAvailable ? "#22c55e" : "#ef4444" }} />
        <span className="text-xs font-['DM_Sans'] tracking-wide" style={{ color: "var(--text-secondary)" }}>
          {!anySizeAvailable
            ? "Out of Stock"
            : sized && selectedSize
              ? selectedStock < 10
                ? `Only ${selectedStock} left in ${selectedSize}`
                : `In Stock (${selectedSize})`
              : sized
                ? "In Stock — select a size"
                : stockCount && stockCount < 10
                  ? `Only ${stockCount} left in stock`
                  : "In Stock"}
        </span>
      </div>

      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Description */}
      <p className="text-sm leading-relaxed font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>

      {/* Colour selector */}
      {hasColors && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}>
              Colour
              {selectedColor
                ? <span className="ml-2 normal-case tracking-normal" style={{ color: "var(--text-secondary)" }}>— {selectedColor}</span>
                : <span className="ml-2 text-red-400 normal-case tracking-normal">— please select</span>}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colorList.map((c) => {
              const active = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => onColorChange?.(c.name)}
                  title={c.name}
                  aria-label={c.name}
                  className="w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    padding: 2,
                  }}
                >
                  <span
                    className="w-full h-full rounded-full block"
                    style={{ backgroundColor: c.hex || "var(--bg-secondary)" }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizeList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}>
              Size
              {!selectedSize && (
                <span className="ml-2 text-red-400 normal-case tracking-normal">— please select</span>
              )}
            </h3>
            {sizeGuide !== "none" && (
              <button type="button" onClick={() => setShowGuide(true)}
                className="text-[10px] tracking-widest uppercase font-['DM_Sans'] underline underline-offset-2 hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)" }}>
                Size Guide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeList.map((size) => {
              const soldOut = sized && stockForSize(size) <= 0;
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => !soldOut && setSelectedSize(size)}
                  disabled={soldOut}
                  title={soldOut ? "Out of stock" : undefined}
                  className="min-w-11 h-11 px-3 rounded-xl text-xs font-bold font-['DM_Sans'] border transition-all duration-200 disabled:cursor-not-allowed relative"
                  style={{
                    backgroundColor: active ? "var(--accent)" : "transparent",
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    color: active ? "#16240f" : soldOut ? "var(--text-muted)" : "var(--text-secondary)",
                    opacity: soldOut ? 0.5 : 1,
                    textDecoration: soldOut ? "line-through" : "none",
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold mb-3 font-['DM_Sans']"
          style={{ color: "var(--text-muted)" }}>
          Quantity
        </h3>
        <div className="inline-flex items-center rounded-full overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center transition-colors hover:opacity-60"
            style={{ color: "var(--text-secondary)" }}>
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-sm font-bold font-['DM_Sans'] border-x"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity((q) => (maxForQty ? Math.min(q + 1, maxForQty) : q + 1))
            }
            disabled={!!maxForQty && quantity >= maxForQty}
            className="w-11 h-11 flex items-center justify-center transition-colors hover:opacity-60 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-secondary)" }}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!canBuy || (sizeList.length > 0 && !selectedSize) || (hasColors && !selectedColor)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: addedToCart ? "var(--accent-2)" : "var(--accent)", color: addedToCart ? "#fff" : "#16240f" }}
        >
          {addedToCart ? <><Check size={15} /> Added to Cart</> : <><ShoppingBag size={15} /> Add to Cart</>}
        </button>

        <button onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: "#25D366", color: "#fff" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Inquire on WhatsApp
        </button>
      </div>

      {/* Back-in-stock notify (shown when sold out) */}
      {showNotify && (
        <BackInStockForm productId={id} size={notifySize} color={selectedColor ?? ""} />
      )}

      {/* Guarantees */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
        {GUARANTEES.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2">
            <Icon size={18} style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-xs font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{label}</p>
              <p className="text-[10px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <SizeGuideModal open={showGuide} onClose={() => setShowGuide(false)} type={sizeGuide} />
    </div>
  );
}