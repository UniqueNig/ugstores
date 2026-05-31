import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { Heart, Gift, Sprout, Users } from "lucide-react";
import { getTeamMembers } from "@/src/lib/data/content";
import { siteConfig } from "@/src/config/site";

// Reflect admin edits to the team within a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us",
  description: `${siteConfig.legalName} curates faith-based gifts, stationery and accessories — chosen with intention to draw you to the place of your Growth. Read our story and values.`,
  alternates: { canonical: "/about" },
};

// Her brand values, drawn from her own About copy.
const VALUES = [
  {
    icon: Heart,
    title: "Chosen with Care",
    desc: "We do not stock what we would not use ourselves, and we never send out what we would not be proud to receive.",
  },
  {
    icon: Gift,
    title: "Gifting with Meaning",
    desc: "A gift is a language. Every set we assemble says: I see you, I celebrate you, I believe in where you are going.",
  },
  {
    icon: Sprout,
    title: "Built for Growth",
    desc: "Every planner and journal is chosen with your goals in mind — tools meant to move you forward, not just sit on a desk.",
  },
  {
    icon: Users,
    title: "For People Like You",
    desc: "The woman building her business between school runs. The student who needs a system. The friend who celebrates people well.",
  },
];

const STATS = [
  { value: "2022", label: "Where it began" },
  { value: "Faith-based", label: "Gifts & souvenirs" },
  { value: "Nationwide", label: "Delivery in Nigeria" },
  { value: "Curated", label: "Never mass-stocked" },
];

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 lg:px-10 overflow-hidden">
        <div className="brand-glow w-120 h-120 top-10 -right-24" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }} />
        <div className="brand-glow w-105 h-105 -bottom-32 -left-20" style={{ backgroundColor: "color-mix(in srgb, var(--accent-2) 40%, transparent)" }} />
        <div className="relative max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase font-['DM_Sans'] mb-4" style={{ color: "var(--accent)" }}>Our Story</p>
          <h1 className="text-5xl md:text-7xl font-black font-['Playfair_Display'] leading-[1.05] max-w-3xl" style={{ color: "var(--text-primary)" }}>
            We started with a pen<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(110deg, var(--accent), var(--accent-2))" }}>and a purpose.</span>
          </h1>
          <p className="text-lg font-['DM_Sans'] leading-relaxed max-w-xl mt-8" style={{ color: "var(--text-secondary)" }}>
            U.G STORE was born from a simple conviction — that the tools you use every day
            should do more than sit on your desk. They should push you forward.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 lg:px-10" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map(({ value, label }) => (
            <div key={label} className="glass rounded-2xl py-6 text-center">
              <p className="text-2xl md:text-3xl font-black font-['Playfair_Display']" style={{ color: "var(--accent)" }}>{value}</p>
              <p className="text-[11px] tracking-widest uppercase font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase font-['DM_Sans'] mb-4" style={{ color: "var(--accent)" }}>How it started</p>
            <h2 className="text-4xl font-black font-['Playfair_Display'] mb-6" style={{ color: "var(--text-primary)" }}>
              From a stationery brand<br />to a place of growth.
            </h2>
            <div className="space-y-4 font-['DM_Sans'] text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <p>We began as a stationery brand — notebooks, planners, pens, highlighters; the everyday essentials that keep life organized and intentions clear.</p>
              <p>But we quickly realized that what our customers were really looking for wasn&apos;t just a journal. It was a nudge. A reminder. A tangible expression of the life they were working toward. So we grew.</p>
              <p>Today, U.G STORE sits at the intersection of organization, gifting, and growth — curating stationery, fashion pieces, and thoughtfully assembled gift sets, because the right things in your hands can change the way you show up in the world.</p>
            </div>
          </div>
          {/* Storefront visual — uses /storefront.jpg if present, with a brand
              gradient fallback layered beneath so a missing file still looks intentional. */}
          <div
            className="relative rounded-3xl overflow-hidden h-112.5 glass-strong"
            style={{
              backgroundImage:
                "url('/storefront.png'), linear-gradient(135deg, color-mix(in srgb, var(--accent) 30%, transparent), color-mix(in srgb, var(--accent-2) 30%, transparent))",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,10,0.45), transparent 60%)" }} />
            <p className="brand-tagline absolute bottom-6 left-6 right-6 text-xl text-white drop-shadow">
              {siteConfig.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 lg:px-10" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-xs tracking-[0.3em] uppercase font-['DM_Sans'] mb-3" style={{ color: "var(--accent)" }}>What we stand for</p>
            <h2 className="text-4xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Our Promise</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }, i) => {
              const brand = i % 2 === 0 ? "var(--accent)" : "var(--accent-2)";
              return (
                <div key={title} className="glass rounded-2xl p-6 space-y-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${brand} 16%, transparent)`, color: brand }}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{title}</h3>
                  <p className="text-sm font-['DM_Sans'] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team — only shown when the admin has added members */}
      {team.length > 0 && (
        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14">
              <p className="text-xs tracking-[0.3em] uppercase font-['DM_Sans'] mb-3" style={{ color: "var(--accent)" }}>The people</p>
              <h2 className="text-4xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Meet the Team</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map(({ id, name, role, image }) => (
                <div key={id} className="group">
                  <div className="relative overflow-hidden rounded-2xl aspect-3/4 mb-4 shadow-sm group-hover:shadow-xl transition-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
                    {image ? (
                      <Image src={image} alt={name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: "var(--bg-secondary)" }} />
                    )}
                  </div>
                  <h3 className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{name}</h3>
                  {role && <p className="text-xs tracking-widest uppercase font-['DM_Sans'] mt-0.5" style={{ color: "var(--accent-2)" }}>{role}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-24 px-6 lg:px-10 overflow-hidden text-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="brand-glow w-105 h-105 -top-24 left-1/2 -translate-x-1/2" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 35%, transparent)" }} />
        <div className="relative glass-strong rounded-3xl max-w-xl mx-auto px-8 py-14">
          <h2 className="text-3xl md:text-4xl font-black font-['Playfair_Display'] mb-4" style={{ color: "var(--text-primary)" }}>
            Let&apos;s get you closer to Growth.
          </h2>
          <p className="text-sm font-['DM_Sans'] mb-8" style={{ color: "var(--text-secondary)" }}>
            Browse our curated stationery, gifts and accessories — chosen with care, packaged to mean something.
          </p>
          <a href="/shop" className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
            Shop the Collection
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
