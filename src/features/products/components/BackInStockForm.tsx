"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

type Props = {
  productId: string;
  size?: string;
  color?: string | null;
};

/**
 * "Notify me when back in stock" — shown on the product page when the item (or
 * the selected size) is sold out. Posts to /api/back-in-stock, which is
 * rate-limited + honeypot-protected.
 */
export default function BackInStockForm({ productId, size, color }: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          email: email.trim(),
          size: size || "",
          color: color || "",
          website, // honeypot — bots fill this, humans don't
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setDone(true);
      toast("We'll email you when it's back in stock", "success");
    } catch (err: any) {
      toast(err.message || "Could not save your request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        className="flex items-center gap-2 p-4 border"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        <Check size={15} style={{ color: "#22c55e" }} />
        <span className="text-sm font-['DM_Sans']">
          You're on the list — we'll email you when it's back.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-4 border" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Bell size={14} style={{ color: "var(--accent)" }} />
        <span
          className="text-[10px] tracking-[0.25em] uppercase font-bold font-['DM_Sans']"
          style={{ color: "var(--text-muted)" }}
        >
          Notify me when back in stock
        </span>
      </div>

      {/* Honeypot — visually hidden; real users never fill it. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 min-w-0 px-3 py-2.5 text-sm font-['DM_Sans'] outline-none border"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="px-4 py-2.5 text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)", color: "#000" }}
        >
          {submitting ? "..." : "Notify"}
        </button>
      </div>
    </form>
  );
}
