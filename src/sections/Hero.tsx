import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * U.G STORES hero — Apple-glass style.
 *
 * Built on the theme tokens (var(--accent) = orange, var(--accent-2) = green)
 * and the `.glass*` utilities in globals.css. Two soft brand-glow blobs sit
 * behind a frosted-glass panel that carries her real welcome copy. Because it
 * reads from CSS variables, switching theme or dark mode restyles it for free.
 */
export default function HeroSection() {
  // Her catalogue at a glance — doubles as decorative floating glass chips.
  const catalogue = [
    "Journals",
    "Bibles",
    "Pens & Highlighters",
    "Christian Books",
    "Earrings",
    "Scarves",
    "Headwraps",
    "Berets",
  ];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Soft brand glows — orange + green light bleeding through the glass */}
      <div
        className="brand-glow w-[520px] h-[520px] -top-20 -left-24"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
      />
      <div
        className="brand-glow w-[560px] h-[560px] bottom-[-160px] right-[-120px]"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent-2) 45%, transparent)" }}
      />

      {/* Faint grid for depth */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">

          {/* ── Left: the frosted welcome panel ─────────────────────────── */}
          <div className="glass-strong rounded-3xl p-8 md:p-12">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full"
              style={{
                border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
              }}
            >
              <Sparkles size={14} style={{ color: "var(--accent)" }} />
              <span
                className="text-xs tracking-[0.2em] uppercase font-['DM_Sans'] font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Faith-based gifts &amp; stationery
              </span>
            </div>

            {/* Headline — her welcome banner line */}
            <h1 className="font-['Playfair_Display'] leading-[1.05] mb-6">
              <span
                className="block text-4xl md:text-6xl lg:text-7xl font-black"
                style={{ color: "var(--text-primary)" }}
              >
                Drawing you to the
              </span>
              <span
                className="block text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, var(--accent), var(--accent-2))",
                }}
              >
                place of Growth.
              </span>
            </h1>

            <p
              className="text-base md:text-lg max-w-xl mb-10 font-['DM_Sans'] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Journals, Bibles, planners and thoughtfully assembled gift sets —
              curated so the tools in your hands move you forward. We don&apos;t
              stock what we wouldn&apos;t use ourselves.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 font-['DM_Sans'] hover:opacity-90"
                style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
              >
                Shop Now
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/about"
                className="glass inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm tracking-widest uppercase transition-all duration-300 font-['DM_Sans'] hover:opacity-80"
                style={{ color: "var(--text-primary)" }}
              >
                Our Story
              </Link>
            </div>

            {/* Trust row */}
            <div
              className="flex flex-wrap gap-x-10 gap-y-4 mt-12 pt-8 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              {[
                { value: "Since 2022", label: "Curated with care" },
                { value: "Nationwide", label: "Delivery across Nigeria" },
                { value: "Faith-based", label: "Gifts & souvenirs" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-xl font-black font-['Playfair_Display']"
                    style={{ color: "var(--accent-2)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-[11px] tracking-widest uppercase mt-1 font-['DM_Sans']"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: floating glass catalogue chips ───────────────────── */}
          <div className="hidden lg:flex flex-wrap gap-3 content-center justify-center">
            {catalogue.map((item, i) => (
              <span
                key={item}
                className="float-chip glass rounded-full px-5 py-3 text-sm font-['DM_Sans'] font-medium"
                style={{
                  color: "var(--text-primary)",
                  // scatter vertically via margin (the float animation owns transform)
                  marginTop: `${(i % 3) * 14}px`,
                  // each chip bobs at its own pace + phase so they drift out of sync
                  ["--float-dur" as string]: `${4.5 + (i % 4) * 0.7}s`,
                  ["--float-delay" as string]: `${(i % 5) * 0.4}s`,
                  ["--glass-tint" as string]:
                    i % 2 === 0
                      ? "color-mix(in srgb, var(--accent) 12%, rgba(255,255,255,0.55))"
                      : "color-mix(in srgb, var(--accent-2) 12%, rgba(255,255,255,0.55))",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
