import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import FaqAccordion, { type FaqItem } from "./FaqAccordion";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Frequently asked questions about ordering, delivery, returns and payments at ${siteConfig.legalName}.`,
  alternates: { canonical: "/faq" },
};

const FAQS: FaqItem[] = [
  {
    q: "How long does delivery take?",
    a: "Delivery takes 3–21 working days depending on your location. We deliver nationwide, with the Southwest covered fastest.",
  },
  {
    q: "How much is delivery?",
    a: "Fees vary by location: ₦2,000 within Ibadan, ₦3,000 to Abeokuta, ₦4,000 to other parts of Ogun State, ₦5,000 to Lagos, and ₦7,000 to Ondo. Other locations are confirmed at checkout.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cards, bank transfer and USSD — all securely processed in Naira through Paystack. Your payment details are never stored on our servers.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Yes, within 48 hours of delivery, for unused items in their original condition with proof of purchase. Some items (personalised orders, opened gift sets, and certain jewellery for hygiene reasons) are final sale. See our Shipping & Returns page for full details.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "Please inspect your order before the delivery rider leaves or before leaving the pickup station. Report any damage within 24 hours with a clear, unedited video recorded at the point of delivery showing the packaging and item. This protects both of us from disputes that can't be fairly verified.",
  },
  {
    q: "Do your products come in different colours?",
    a: "Many do. Where a product has colour options, you'll see them on the product page — just choose your colour before adding it to your cart.",
  },
  {
    q: "Do you offer discounts or coupons?",
    a: "Yes — keep an eye on our newsletter and homepage for promo codes. You can apply a valid coupon code in your cart before checkout.",
  },
  {
    q: "How do I place an order?",
    a: "Shop on the site and check out securely with Paystack, or message us on WhatsApp and we'll help you order directly.",
  },
];

export default function FaqPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-40 pb-12 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-['DM_Sans'] mb-4" style={{ color: "var(--accent)" }}>
            Help Center
          </p>
          <h1 className="text-5xl md:text-6xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
            Frequently Asked<br />Questions
          </h1>
        </div>
      </section>

      <section className="pb-20 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <FaqAccordion items={FAQS} />

          <div className="text-center mt-12">
            <p className="text-sm font-['DM_Sans'] mb-4" style={{ color: "var(--text-muted)" }}>
              Still have a question?
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
