"use client";

import { useState } from "react";
import ProductImageGallery from "@/src/features/products/components/ProductImageGallery";
import ProductInfo from "@/src/features/products/components/ProductInfo";

export type ProductColor = { name: string; hex: string; images: string[] };

type Props = {
  // Gallery
  baseImages: string[];
  productName: string;
  // Colours (each with its own images)
  colors: ProductColor[];
  // Everything ProductInfo needs (minus the colour wiring, which we own here)
  info: {
    id: string;
    slug?: string;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    isNew?: boolean;
    inStock: boolean;
    stockCount?: number;
    sizes: string[];
    sizeStock?: { size: string; stock: number }[];
    sizeGuide?: "clothing" | "footwear" | "none";
    whatsappNumber: string;
  };
};

/**
 * Client wrapper that renders the product page's two columns (gallery + info)
 * and lets a chosen colour swap the gallery images. The product page itself is
 * a server component, so this coordination has to live in one client island.
 */
export default function ProductDetailClient({
  baseImages,
  productName,
  colors,
  info,
}: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // When a colour with its own images is selected, show those; otherwise the
  // product's base gallery. The `key` forces the gallery to reset to image #1.
  const activeColor = colors.find((c) => c.name === selectedColor);
  const galleryImages =
    activeColor && activeColor.images.length > 0 ? activeColor.images : baseImages;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
      {/* Left — image gallery (swaps with colour) */}
      <div className="w-full">
        <ProductImageGallery
          key={selectedColor ?? "base"}
          images={galleryImages}
          productName={productName}
        />
      </div>

      {/* Right — product info */}
      <div className="w-full lg:sticky lg:top-28 lg:self-start">
        <ProductInfo
          {...info}
          colors={colors}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      </div>
    </div>
  );
}
