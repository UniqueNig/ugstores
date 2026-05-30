"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[780px] flex-shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="relative shrink-0 w-20 h-24 md:w-24 md:h-28 overflow-hidden rounded-xl border-2 transition-all duration-200"  // ✅ bigger thumbnails
            style={{
              borderColor: activeIndex === i ? "var(--accent)" : "var(--border)",
              opacity: activeIndex === i ? 1 : 0.6,
            }}
          >
            <Image src={img} alt={`${productName} view ${i + 1}`} fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className="relative flex-1 overflow-hidden rounded-2xl cursor-zoom-in"
        style={{
          backgroundColor: "var(--card-bg)",
          aspectRatio: "2/3",        // ✅ taller ratio (was 3/4)
          maxHeight: "780px",        // ✅ was 600px
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {images[activeIndex] ? (
          <Image
            src={images[activeIndex]}
            alt={productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-200"
            style={{
              transform: zoomed ? "scale(1.6)" : "scale(1)",
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "var(--bg-secondary)" }} />
        )}

        {!zoomed && (
          <div
            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] tracking-widest uppercase font-['DM_Sans']"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-primary) 70%, transparent)",
              color: "var(--text-muted)",
            }}
          >
            <ZoomIn size={11} /> Hover to zoom
          </div>
        )}

        <div
          className="absolute top-4 right-4 text-[10px] tracking-widest font-['DM_Sans'] px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg-primary) 70%, transparent)",
            color: "var(--text-muted)",
          }}
        >
          {activeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}