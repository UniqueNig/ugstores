import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/src/config/site";

// Auto-generated social share card (link previews on WhatsApp, X, Facebook…).
// Uses the REAL logo for brand consistency (logo already includes the tagline).
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  // Embed the actual logo file as a data URI (runs at build on the Node runtime).
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px",
          backgroundColor: "#FFFFFF",
          backgroundImage:
            "linear-gradient(135deg, #FFFFFF 50%, rgba(255,170,0,0.14) 80%, rgba(45,116,39,0.18))",
        }}
      >
        {/* logo.png is ~4:1; keep that ratio */}
        <img
          src={logoSrc}
          width={960}
          height={240}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
