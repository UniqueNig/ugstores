"use client";

import { X } from "lucide-react";

// Apparel chart (cm).
const CLOTHING = {
  note: "Body measurements in centimetres (cm). Between sizes? Size up.",
  cols: ["Size", "Chest", "Waist", "Hips"],
  rows: [
    ["XS", "81–86", "66–71", "86–91"],
    ["S", "86–91", "71–76", "91–96"],
    ["M", "96–101", "81–86", "101–106"],
    ["L", "106–111", "91–96", "111–116"],
    ["XL", "116–121", "101–106", "121–126"],
    ["XXL", "126–131", "111–116", "131–136"],
  ],
};

// Footwear conversion (approx, unisex).
const FOOTWEAR = {
  note: "Foot length in centimetres (cm). Sizes are approximate conversions.",
  cols: ["UK", "EU", "US", "Foot (cm)"],
  rows: [
    ["5", "38", "6", "24.5"],
    ["6", "39", "7", "25.4"],
    ["7", "41", "8", "26.0"],
    ["8", "42", "9", "26.7"],
    ["9", "43", "10", "27.3"],
    ["10", "44", "11", "28.0"],
    ["11", "45", "12", "28.8"],
    ["12", "46", "13", "29.5"],
  ],
};

export default function SizeGuideModal({
  open,
  onClose,
  type = "clothing",
}: {
  open: boolean;
  onClose: () => void;
  type?: "clothing" | "footwear" | "none";
}) {
  if (!open) return null;

  const chart = type === "footwear" ? FOOTWEAR : CLOTHING;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg border p-6"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-lg font-black font-['Playfair_Display']"
            style={{ color: "var(--text-primary)" }}
          >
            Size Guide — {type === "footwear" ? "Footwear" : "Clothing"}
          </h3>
          <button
            onClick={onClose}
            className="hover:opacity-60 transition-opacity"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs font-['DM_Sans'] mb-4" style={{ color: "var(--text-muted)" }}>
          {chart.note}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-['DM_Sans']">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {chart.cols.map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 text-[10px] tracking-widest uppercase font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row) => (
                <tr key={row[0]} style={{ borderBottom: "1px solid var(--border)" }}>
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`py-2.5 ${i === 0 ? "font-bold" : ""}`}
                      style={{ color: i === 0 ? "var(--accent)" : "var(--text-secondary)" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
