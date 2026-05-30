"use client";

import { useState } from "react";
import { siteConfig } from "@/src/config/site";

/**
 * Brand logo.
 *
 * IMPORTANT: we only ever request image files we KNOW exist. Requesting a
 * missing file 404s and — in production, where the error can fire before React
 * hydrates — leaves a broken-image icon that onError can't recover. So the
 * optional logos are gated behind explicit flags below. Flip a flag the moment
 * you drop the matching file in /public.
 *
 * - public/logo.png        → always used (the main lockup)
 * - public/logo-dark.png   → set HAS_DARK_LOGO = true after adding (dark mode)
 * - public/logo-badge.png  → set HAS_BADGE = true after adding (compact/mobile)
 *
 * Until those exist: dark mode shows logo.png (orange reads on dark), and the
 * mobile/compact slot shows the two-tone "U.G STORES" wordmark — both clean,
 * neither breaks.
 */
const HAS_DARK_LOGO = false; // ← set true once public/logo-dark.png exists
const HAS_BADGE = false; // ← set true once public/logo-badge.png exists

export default function Logo({
  height = 40,
  className = "",
  variant = "full",
}: {
  height?: number;
  className?: string;
  variant?: "full" | "badge";
}) {
  const [failed, setFailed] = useState(false);

  const wordmark = (
    <span
      className={`text-xl md:text-2xl font-black tracking-tighter whitespace-nowrap font-['Playfair_Display'] ${className}`}
      style={{ color: "var(--text-primary)" }}
    >
      {siteConfig.wordmark.start}
      <span style={{ color: "var(--accent)" }}>{siteConfig.wordmark.end}</span>
    </span>
  );

  // ── Compact slot (mobile nav): badge if available, else the wordmark ───────
  if (variant === "badge") {
    if (!HAS_BADGE || failed) return wordmark;
    return (
      <img
        src="/logo-badge.png"
        alt={siteConfig.name}
        style={{ height, width: "auto" }}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  // ── Full lockup ───────────────────────────────────────────────────────────
  if (failed) return wordmark;

  // No dark variant yet → use logo.png in BOTH themes (never request a 404).
  if (!HAS_DARK_LOGO) {
    return (
      <img
        src="/logo.png"
        alt={siteConfig.name}
        style={{ height, width: "auto" }}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  // Dark variant exists → swap by theme.
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt={siteConfig.name}
        style={{ height, width: "auto" }}
        className="block dark:hidden"
        onError={() => setFailed(true)}
      />
      <img
        src="/logo-dark.png"
        alt={siteConfig.name}
        style={{ height, width: "auto" }}
        className="hidden dark:block"
      />
    </span>
  );
}
