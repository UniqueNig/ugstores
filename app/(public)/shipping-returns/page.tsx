import type { Metadata } from "next";
import PolicyPage from "@/src/components/layout/PolicyPage";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: `Delivery timelines, shipping costs, and how to return or exchange an item at ${siteConfig.legalName}.`,
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return (
    <PolicyPage
      title="Shipping & Returns"
      updated="May 2026"
      intro="Everything you need to know about how we deliver your order and how to return it if something isn't right."
      sections={[
        {
          heading: "Processing Time",
          paragraphs: [
            "Orders are processed within 1–2 business days after payment is confirmed. You'll receive a confirmation once your order is on its way.",
          ],
        },
        {
          heading: "Delivery Options",
          paragraphs: [
            "Standard Delivery (₦3,000): 5–7 business days nationwide.",
            "Express Delivery (₦7,000): 2–3 business days nationwide.",
            "Delivery times are estimates and may vary by location.",
          ],
        },
        {
          heading: "Returns & Exchanges",
          paragraphs: [
            "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original packaging with tags attached.",
            "To start a return, contact us with your order reference and reason. We'll guide you through the next steps.",
          ],
        },
        {
          heading: "Refunds",
          paragraphs: [
            "Once we receive and inspect your return, your refund is processed to your original payment method within 5–10 business days.",
            "Shipping fees are non-refundable unless the return is due to our error (wrong or defective item).",
          ],
        },
        {
          heading: "Damaged or Wrong Items",
          paragraphs: [
            "If you receive a damaged or incorrect item, contact us within 48 hours of delivery with photos and we'll make it right at no cost to you.",
          ],
        },
      ]}
    />
  );
}
