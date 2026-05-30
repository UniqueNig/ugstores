import type { Metadata } from "next";
import PolicyPage from "@/src/components/layout/PolicyPage";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms and conditions for using ${siteConfig.legalName} and purchasing from our store.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      updated="May 2026"
      intro="By using this website and placing an order, you agree to the following terms. Please read them carefully."
      sections={[
        {
          heading: "Using Our Store",
          paragraphs: [
            "You agree to provide accurate information when creating an account or placing an order, and not to use the store for any unlawful purpose.",
            "We reserve the right to refuse or cancel any order at our discretion, for example in cases of suspected fraud or pricing errors.",
          ],
        },
        {
          heading: "Pricing & Availability",
          paragraphs: [
            "All prices are shown in Nigerian Naira (₦) and include applicable charges shown at checkout. Prices and product availability may change without notice.",
            "If an item becomes unavailable after you order, we will notify you and issue a refund where payment was made.",
          ],
        },
        {
          heading: "Orders & Payment",
          paragraphs: [
            "Your order is confirmed once payment is successfully verified. We use Paystack to process payments securely.",
            "The final amount charged is always calculated on our server from current product prices, so the price you pay matches the items in your order.",
          ],
        },
        {
          heading: "Returns",
          paragraphs: [
            "Returns are governed by our Shipping & Returns policy. Items must be unworn and in their original condition within the return window.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "We provide the store on an \"as is\" basis and are not liable for indirect or incidental damages arising from its use, to the extent permitted by law.",
          ],
        },
        {
          heading: "Changes to These Terms",
          paragraphs: [
            "We may update these terms from time to time. Continued use of the store after changes means you accept the updated terms.",
          ],
        },
      ]}
    />
  );
}
