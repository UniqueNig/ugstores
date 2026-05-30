import type { Metadata } from "next";
import PolicyPage from "@/src/components/layout/PolicyPage";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.legalName} collects, uses, and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updated="May 2026"
      intro="Your privacy matters to us. This policy explains what information we collect, why we collect it, and how we keep it safe."
      sections={[
        {
          heading: "Information We Collect",
          paragraphs: [
            "When you place an order or create an account, we collect your name, email address, phone number, and shipping address. This information is necessary to process and deliver your orders.",
            "We do not collect or store your card details. All payments are handled securely by our payment processor, Paystack.",
          ],
        },
        {
          heading: "How We Use Your Information",
          paragraphs: [
            "We use your information to fulfil orders, communicate about your purchases, provide customer support, and — only if you opt in — send you marketing emails.",
            "You can unsubscribe from marketing emails at any time using the link in those emails.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "We use cookies and local storage to keep your cart and preferences between visits. These are essential to how the store works and do not identify you personally.",
          ],
        },
        {
          heading: "Data Sharing",
          paragraphs: [
            "We never sell your data. We share information only with the services required to run the store — for example, our payment processor (Paystack) and email provider — and only what they need to function.",
          ],
        },
        {
          heading: "Your Rights",
          paragraphs: [
            "You can request access to, correction of, or deletion of your personal data at any time by contacting us. You may also delete your account from your dashboard settings.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Questions about this policy? Reach us through our Contact page and we'll respond promptly.",
          ],
        },
      ]}
    />
  );
}
