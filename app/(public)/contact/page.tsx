import type { Metadata } from "next";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import ContactForm from "./ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.legalName} — questions about orders, products, returns, or anything else. We're happy to help.`,
  alternates: { canonical: "/contact" },
};

const { email, phone, whatsapp, location } = siteConfig.contact;
const DETAILS = [
  { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
  { icon: Phone, label: "Phone / WhatsApp", value: phone, href: `https://wa.me/${whatsapp}` },
  { icon: MapPin, label: "Location", value: location, href: null },
  { icon: Clock, label: "Hours", value: "Mon – Sat, 9am – 6pm WAT", href: null },
];

export default function ContactPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-40 pb-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase font-['DM_Sans'] mb-4" style={{ color: "var(--accent)" }}>
            Get in touch
          </p>
          <h1 className="text-5xl md:text-6xl font-black font-['Playfair_Display'] leading-[1.05] max-w-2xl" style={{ color: "var(--text-primary)" }}>
            We&apos;d love to<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(110deg, var(--accent), var(--accent-2))" }}>hear from you.</span>
          </h1>
          <p className="text-lg font-['DM_Sans'] leading-relaxed max-w-xl mt-6" style={{ color: "var(--text-secondary)" }}>
            Questions about an order, a product, or a return? Send us a message and we'll get back within 24 hours.
          </p>
        </div>
      </section>

      <section className="pb-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
          {/* Contact details */}
          <div className="space-y-8">
            {DETAILS.map(({ icon: Icon, label, value, href }, i) => {
              const brand = i % 2 === 0 ? "var(--accent)" : "var(--accent-2)";
              return (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `color-mix(in srgb, ${brand} 14%, transparent)`, color: brand }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] mb-1" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="text-sm font-['DM_Sans'] hover:opacity-70 transition-opacity" style={{ color: "var(--text-primary)" }}>
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{value}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* WhatsApp quick CTA — her preferred channel for orders */}
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Form */}
          <div className="glass-strong rounded-3xl p-6 lg:p-8">
            <h2 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans'] mb-6" style={{ color: "var(--text-muted)" }}>
              Send a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
