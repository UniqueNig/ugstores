import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Generates /robots.txt — tells crawlers what they may and may not index.
 * Private/app areas are disallowed; the sitemap is advertised.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/api",
        "/cart",
        "/checkout",
        "/order-success",
        "/login",
        "/register",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
