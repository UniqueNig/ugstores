import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";
import Logo from "../ui/Logo";
import { siteConfig } from "@/src/config/site";

export default function Footer() {
  // Only the socials the client actually filled in (others are "" → hidden).
  const socials = [
    { href: siteConfig.social.instagram, Icon: Instagram, label: "Instagram" },
    { href: siteConfig.social.twitter, Icon: Twitter, label: "Twitter / X" },
    { href: siteConfig.social.facebook, Icon: Facebook, label: "Facebook" },
  ].filter((s) => s.href);

  return (
    <footer
      className="border-t py-16 px-6 lg:px-10"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo height={48} />
            <p
              className="brand-tagline text-base mt-4 leading-relaxed max-w-xs"
              style={{ color: "var(--accent-2)" }}
            >
              {siteConfig.tagline}
            </p>

            {/* Social icons (frosted glass chips) */}
            {socials.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="glass rounded-full p-2.5 transition-all duration-300 hover:opacity-80"
                    style={{ color: "var(--accent-2)" }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          {[
            {
              title: "Shop",
              links: [
                { label: "All Products", href: "/shop" },
                { label: "Categories", href: "/categories" },
                { label: "Search", href: "/search" },
                { label: "Cart", href: "/cart" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "FAQ", href: "/faq" },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "Shipping & Returns", href: "/shipping-returns" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
                { label: "My Orders", href: "/dashboard/orders" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                className="text-xs tracking-widest uppercase mb-5 font-['DM_Sans'] font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="footer-link text-sm transition-colors duration-200 font-['DM_Sans']"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-xs font-['DM_Sans'] tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </p>

          <div className="flex gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Shipping & Returns", href: "/shipping-returns" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="footer-link text-xs transition-colors duration-200 font-['DM_Sans'] tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Developer credit */}
        <div className="mt-8 text-center">
          <p
            className="text-xs font-['DM_Sans'] tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Developed by{" "}
            <a
              href="https://emmanuelfaniyi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-opacity duration-200 hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              tech with dami
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}