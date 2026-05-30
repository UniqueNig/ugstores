"use client";

import { SlidersHorizontal, LayoutGrid, LayoutList } from "lucide-react";

type ShopHeaderProps = {
  totalProducts: number;
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function ShopHeader({
  totalProducts,
  view,
  setView,
  sortBy,
  setSortBy,
  sidebarOpen,
  setSidebarOpen,
}: ShopHeaderProps) {
  return (
    <div
      className="flex items-center justify-between py-5 mb-8 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Left — count + mobile filter toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="glass lg:hidden flex items-center gap-2 text-xs tracking-widest uppercase font-['DM_Sans'] transition-colors px-4 py-2 rounded-full"
          style={{ color: "var(--text-primary)" }}
        >
          <SlidersHorizontal size={13} />
          Filters
        </button>
        <p
          className="text-xs font-['DM_Sans'] tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          <span style={{ color: "var(--text-primary)" }} className="font-bold">
            {totalProducts}
          </span>{" "}
          products
        </p>
      </div>

      {/* Right — sort + view toggle */}
      <div className="flex items-center gap-4">
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs tracking-wide font-['DM_Sans'] px-4 py-2 rounded-full border outline-none cursor-pointer"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* View toggle — desktop only */}
        <div
          className="hidden md:flex items-center rounded-full overflow-hidden border"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setView("grid")}
            className="px-3 py-2 transition-colors"
            style={{
              backgroundColor:
                view === "grid" ? "var(--accent)" : "transparent",
              color: view === "grid" ? "#16240f" : "var(--text-muted)",
            }}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className="px-3 py-2 transition-colors"
            style={{
              backgroundColor:
                view === "list" ? "var(--accent)" : "transparent",
              color: view === "list" ? "#16240f" : "var(--text-muted)",
            }}
          >
            <LayoutList size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}