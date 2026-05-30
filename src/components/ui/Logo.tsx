"use client";

import { useState } from "react";
import { siteConfig } from "@/src/config/site";

/**
 * Brand logo.
 *
 * variant="full" (default): the horizontal lockup from /public.
 *   - /logo.png in light mode, /logo-dark.png in dark mode (add the latter for
 *     legibility on dark backgrounds), falling back to the text wordmark.
 *
 * variant="badge": the compact circular badge (/logo-badge.png) — used in the
 *   mobile navbar where the full lockup's tagline is too small to read. The
 *   green badge is self-contained, so it reads on light AND dark. Falls back to
 *   the two-tone text wordmark if the badge file isn't there yet.
 */
export default function Logo({
  height = 40,
  className = "",
  variant = "full",
}: {
  height?: number;
  className?: string;
  variant?: "full" | "badge";
}) {
  const [lightFailed, setLightFailed] = useState(false);
  const [darkFailed, setDarkFailed] = useState(false);
  const [badgeFailed, setBadgeFailed] = useState(false);

  const wordmark = (
    <span
      className={`text-xl md:text-2xl font-black tracking-tighter whitespace-nowrap font-['Playfair_Display'] ${className}`}
      style={{ color: "var(--text-primary)" }}
    >
      {siteConfig.wordmark.start}
      <span style={{ color: "var(--accent)" }}>{siteConfig.wordmark.end}</span>
    </span>
  );

  // ── Compact badge (mobile nav) ────────────────────────────────────────────
  if (variant === "badge") {
    if (badgeFailed) return wordmark;
    return (
      <img
        src="/logo-badge.png"
        alt={siteConfig.name}
        style={{ height, width: "auto" }}
        className={className}
        onError={() => setBadgeFailed(true)}
      />
    );
  }

  // ── Full lockup ─────────────────────────────────────────────────────────
  if (lightFailed && darkFailed) return wordmark;

  return (
    <span className={`inline-flex items-center ${className}`}>
      {!lightFailed && (
        <img
          src="/logo.png"
          alt={siteConfig.name}
          style={{ height, width: "auto" }}
          className="block dark:hidden"
          onError={() => setLightFailed(true)}
        />
      )}
      <img
        src={darkFailed ? "/logo.png" : "/logo-dark.png"}
        alt={siteConfig.name}
        style={{ height, width: "auto" }}
        className="hidden dark:block"
        onError={() => {
          if (!darkFailed) setDarkFailed(true);
          else setLightFailed(true);
        }}
      />
    </span>
  );
}
