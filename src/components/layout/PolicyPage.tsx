import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";

export type PolicySection = { heading: string; paragraphs: string[] };

/**
 * Reusable layout for static legal/policy pages (Privacy, Terms, Shipping…).
 * Keeps all such pages visually consistent — pass a title + sections.
 */
export default function PolicyPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro?: string;
  updated?: string;
  sections: PolicySection[];
}) {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-40 pb-12 px-6 lg:px-10 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
          {updated && (
            <p className="text-xs tracking-widest uppercase font-['DM_Sans'] mt-4" style={{ color: "var(--text-muted)" }}>
              Last updated: {updated}
            </p>
          )}
          {intro && (
            <p className="text-base font-['DM_Sans'] leading-relaxed mt-6" style={{ color: "var(--text-secondary)" }}>
              {intro}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-bold font-['Playfair_Display'] mb-3" style={{ color: "var(--text-primary)" }}>
                {s.heading}
              </h2>
              <div className="space-y-3">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
