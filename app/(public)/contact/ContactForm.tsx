"use client";

import { useState } from "react";
import { Loader2, Send, Check } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all";
const inputStyle = {
  backgroundColor: "var(--bg-primary)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
};
const labelClass =
  "text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] block mb-1.5";

export default function ContactForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not send message");
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
      toast("Message sent — we'll be in touch!", "success");
    } catch (err) {
      toast((err as Error).message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Honeypot — hidden from users, catches bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: "var(--text-muted)" }}>Name *</label>
          <input required className={inputClass} style={inputStyle} value={form.name}
            onChange={(e) => update("name", e.target.value)} placeholder="John Doe" />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--text-muted)" }}>Email *</label>
          <input required type="email" className={inputClass} style={inputStyle} value={form.email}
            onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Subject</label>
        <input className={inputClass} style={inputStyle} value={form.subject}
          onChange={(e) => update("subject", e.target.value)} placeholder="How can we help?" />
      </div>
      <div>
        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Message *</label>
        <textarea required rows={5} className={inputClass} style={{ ...inputStyle, resize: "none" }}
          value={form.message} onChange={(e) => update("message", e.target.value)}
          placeholder="Tell us a bit more..." />
      </div>
      <button type="submit" disabled={loading || sent}
        className="flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity disabled:opacity-60"
        style={{ backgroundColor: sent ? "var(--accent-2)" : "var(--accent)", color: sent ? "#fff" : "#16240f" }}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : sent ? <Check size={14} /> : <Send size={14} />}
        {sent ? "Sent!" : loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
