import Link from "next/link";
import Logo from "@/src/components/ui/Logo";

type AuthCardProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
};

export default function AuthCard({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-5"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Decoration layer — fixed to the viewport and clips its own overflow,
          so the glow blobs can NEVER add document scroll (vertical or horizontal).
          The `position: fixed` here also has to beat .brand-glow's absolute, so
          these blobs are positioned with plain inline styles, not that class. */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute -top-20 -right-20 w-125 h-125 rounded-full"
          style={{ filter: "blur(120px)", opacity: 0.5, backgroundColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-125 h-125 rounded-full"
          style={{ filter: "blur(120px)", opacity: 0.5, backgroundColor: "color-mix(in srgb, var(--accent-2) 40%, transparent)" }}
        />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Link href="/">
            <Logo height={38} />
          </Link>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 md:p-7">
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-2xl font-black font-['Playfair_Display'] mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h1>
            <p
              className="text-sm font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              {subtitle}
            </p>
          </div>

          {/* Form content */}
          {children}
        </div>

        {/* Footer link */}
        <p
          className="text-center text-sm font-['DM_Sans'] mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-bold transition-colors hover:opacity-70"
            style={{ color: "var(--accent)" }}
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
