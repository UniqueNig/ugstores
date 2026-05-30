import { Truck, ShieldCheck, RefreshCw, MessageCircle } from "lucide-react";

// Copy tailored to U.G STORES (her real delivery + 48-hour returns + WhatsApp).
const PROPS = [
  { icon: Truck, title: "Nationwide Delivery", desc: "Tracked shipping across Nigeria — Southwest and beyond." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Protected checkout powered by Paystack." },
  { icon: RefreshCw, title: "48-Hour Returns", desc: "Easy exchanges on eligible items within 48 hours." },
  { icon: MessageCircle, title: "Real Support", desc: "Chat with us on WhatsApp, any time." },
];

export default function ValueProps() {
  return (
    <section
      className="py-16 px-6 lg:px-10"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PROPS.map(({ icon: Icon, title, desc }, i) => {
          // Alternate the two brand colours across the four cards.
          const brand = i % 2 === 0 ? "var(--accent)" : "var(--accent-2)";
          return (
            <div key={title} className="glass rounded-2xl p-6 flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `color-mix(in srgb, ${brand} 16%, transparent)`,
                  color: brand,
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="text-xs font-['DM_Sans'] mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
