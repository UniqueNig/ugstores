"use client";

import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

export default function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not subscribe");
      setDone(true);
      setEmail("");
      toast("You're subscribed! 🎉", "success");
    } catch (err) {
      toast((err as Error).message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24 px-6 lg:px-10 overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
      {/* Brand glows behind the glass card */}
      <div className="brand-glow w-105 h-105 -top-24 left-[10%]" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }} />
      <div className="brand-glow w-105 h-105 -bottom-32 right-[10%]" style={{ backgroundColor: "color-mix(in srgb, var(--accent-2) 40%, transparent)" }} />

      <div className="relative glass-strong rounded-3xl max-w-2xl mx-auto text-center px-6 py-14 md:px-12">
        <div
          className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}
        >
          <Mail size={20} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black font-['Playfair_Display'] mb-3" style={{ color: "var(--text-primary)" }}>
          Stay in the loop
        </h2>
        <p className="text-sm font-['DM_Sans'] mb-8 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
          New arrivals, gift ideas, and thoughtful finds to draw you closer to the place of your Growth. No spam — ever.
        </p>

        <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            aria-hidden="true"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-5 py-3.5 rounded-full text-sm font-['DM_Sans'] outline-none border"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            disabled={loading || done}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: done ? "var(--accent-2)" : "var(--accent)", color: "#16240f" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={14} /> : null}
            {done ? "Subscribed" : loading ? "..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
