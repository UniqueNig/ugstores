"use client";

import { X } from "lucide-react";

// type ShopSidebarProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedCategory: string;
//   setSelectedCategory: (c: string) => void;
//   priceRange: [number, number];
//   setPriceRange: (r: [number, number]) => void;
//   selectedSizes: string[];
//   toggleSize: (s: string) => void;
// };

// const CATEGORIES = [
//   { label: "All", value: "all", count: 148 },
//   { label: "Tops", value: "tops", count: 42 },
//   { label: "Bottoms", value: "bottoms", count: 31 },
//   { label: "Outerwear", value: "outerwear", count: 18 },
//   { label: "Accessories", value: "accessories", count: 56 },
// ];

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ShopSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[]; // ✅ NEW
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
};

const MAX_PRICE = 1000000;

// NOTE: U.G STORES products vary by COLOUR, not clothing size, so the size
// filter is intentionally hidden. `selectedSizes`/`toggleSize` stay in the
// props contract (parent still passes them) for easy re-enabling later.
export default function ShopSidebar({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
}: ShopSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-24 left-0 h-full lg:h-auto z-50 lg:z-auto
          w-72 lg:w-56 xl:w-64 flex-shrink-0
          transition-transform duration-300 lg:transition-none
          overflow-y-auto lg:overflow-visible
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center justify-between p-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-xs tracking-widest uppercase font-bold font-['DM_Sans']"
            style={{ color: "var(--text-primary)" }}
          >
            Filters
          </span>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-5 lg:p-0 space-y-8">
          {/* Categories */}
          <div>
            <h3
              className="text-[10px] tracking-[0.25em] uppercase font-bold mb-4 font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              Category
            </h3>
            <ul className="space-y-1">
              {/* All */}
              <li>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-['DM_Sans'] transition-colors"
                  style={{
                    backgroundColor:
                      selectedCategory === "all"
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : "transparent",
                    color:
                      selectedCategory === "all"
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                    fontWeight: selectedCategory === "all" ? "700" : "400",
                  }}
                >
                  All
                </button>
              </li>

              {/* Dynamic categories */}
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm font-['DM_Sans'] transition-colors"
                    style={{
                      backgroundColor:
                        selectedCategory === cat.slug
                          ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                          : "transparent",
                      color:
                        selectedCategory === cat.slug
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                      fontWeight: selectedCategory === cat.slug ? "700" : "400",
                    }}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border)" }} />

          {/* Price Range */}
          {/* Price Range */}
          <div>
            <h3
              className="text-[10px] tracking-[0.25em] uppercase font-bold mb-4 font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              Price Range
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-['DM_Sans'] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  ₦{priceRange[0].toLocaleString()}
                </span>
                <span
                  className="text-sm font-['DM_Sans'] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  ₦{priceRange[1].toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="w-full h-0.5 cursor-pointer"
                style={{ accentColor: "var(--accent)" }}
              />
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full h-0.5 cursor-pointer"
                style={{ accentColor: "var(--accent)" }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border)" }} />

          {/* Clear filters */}
          <button
            onClick={() => {
              setSelectedCategory("all");
              setPriceRange([0, MAX_PRICE]);
            }}
            className="w-full py-2.5 rounded-full text-xs tracking-widest uppercase font-['DM_Sans'] border transition-all duration-200 hover:opacity-70"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Clear Filters
          </button>
        </div>
      </aside>
    </>
  );
}
