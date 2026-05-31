import { ImageResponse } from "next/og";
import { siteConfig } from "@/src/config/site";

// Auto-generated social share card (link previews on WhatsApp, X, Facebook…).
// Next wires this into <meta og:image> for every page that doesn't set its own.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          backgroundColor: "#FFFFFF",
          backgroundImage:
            "linear-gradient(135deg, #FFFFFF 55%, rgba(255,170,0,0.14) 80%, rgba(45,116,39,0.18))",
          fontFamily: "sans-serif",
        }}
      >
        {/* Badge + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
          <div
            style={{
              width: "112px",
              height: "112px",
              borderRadius: "9999px",
              backgroundColor: "#2D7427",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "62px",
              fontWeight: 800,
            }}
          >
            U
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "92px",
              fontWeight: 800,
              color: "#FFAA00",
              letterSpacing: "-2px",
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            marginTop: "38px",
            fontSize: "46px",
            fontStyle: "italic",
            color: "#2D7427",
          }}
        >
          {siteConfig.tagline}
        </div>

        {/* Sub-line */}
        <div
          style={{
            display: "flex",
            marginTop: "22px",
            fontSize: "28px",
            color: "#555555",
          }}
        >
          Faith-based gifts · Stationery · Accessories
        </div>
      </div>
    ),
    { ...size },
  );
}
