import { Star, Quote } from "lucide-react";
import { getTestimonials } from "@/src/lib/data/content";

export default async function Testimonials() {
  const reviews = await getTestimonials();
  if (reviews.length === 0) return null;

  return (
    <section className="py-24 px-6 lg:px-10" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-['DM_Sans']" style={{ color: "var(--accent)" }}>
            Loved by customers
          </p>
          <h2 className="text-4xl md:text-5xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
            What People Say
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="glass rounded-3xl p-8 relative">
              <Quote size={28} style={{ color: "var(--accent)", opacity: 0.4 }} />
              <div className="flex gap-1 my-4">
                {Array.from({ length: Math.max(1, Math.min(5, r.rating)) }).map((_, i) => (
                  <Star key={i} size={14} fill="var(--accent)" style={{ color: "var(--accent)" }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                “{r.text}”
              </p>
              <div className="mt-6">
                <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--accent-2)" }}>
                  {r.name}
                </p>
                {r.location && (
                  <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                    {r.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
