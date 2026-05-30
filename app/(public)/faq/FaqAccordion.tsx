"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export type FaqItem = { q: string; a: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="glass rounded-3xl overflow-hidden divide-y" style={{ borderColor: "var(--border)" }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-opacity hover:opacity-80"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                {item.q}
              </span>
              <span className="shrink-0" style={{ color: "var(--accent)" }}>
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 -mt-1">
                <p className="text-sm leading-relaxed font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
