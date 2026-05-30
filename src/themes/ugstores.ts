import type { ThemePalette } from "./types";

/**
 * "ugstores" — the custom Apple-glass theme for U.G STORES.
 *
 * Brand colours (pulled from her logo):
 *   - Orange  #F4A01C  → primary accent: CTAs, glows, highlights
 *   - Green   #2E7D1E  → secondary accent (accent-2): structure, links, success
 *
 * Design intent: a light, airy, near-white base (so frosted-glass panels read
 * clearly) with orange as the one saturated "glow" colour and green as the
 * calmer structural colour. Matches her stated "premium & rich" style.
 *
 * The frosted-blur *look* is applied by the `.glass` utilities in globals.css —
 * this file only supplies the colour values behind the CSS variables.
 */
const ugstores: ThemePalette = {
  light: {
    "bg-primary": "#fbfbf9", // warm off-white, lets glass tints show
    "bg-secondary": "#f1f5f0", // faint green-tinted wash for alt sections
    "text-primary": "#16240f", // deep green-black ink
    "text-secondary": "#3f4a39", // muted green-charcoal
    "text-muted": "#8a917f",
    "accent": "#f4a01c", // brand orange
    "accent-hover": "#d98410",
    "accent-2": "#2e7d1e", // brand green
    "accent-2-hover": "#245f18",
    "border": "rgba(46, 125, 30, 0.16)", // green hairline edge
    "card-bg": "#ffffff",
    "nav-bg": "rgba(251, 251, 249, 0.7)", // glassy nav (pairs with backdrop-blur)
  },
  dark: {
    "bg-primary": "#0b0f0a", // near-black, green undertone
    "bg-secondary": "#10150d",
    "text-primary": "#f4f6f1",
    "text-secondary": "#b7c0b0",
    "text-muted": "#6b7264",
    "accent": "#f8b23e", // lighter orange, legible on dark
    "accent-hover": "#fac56a",
    "accent-2": "#5fbf2e", // vivid green for dark mode
    "accent-2-hover": "#7ad34a",
    "border": "rgba(255, 255, 255, 0.12)",
    "card-bg": "#11160e",
    "nav-bg": "rgba(11, 15, 10, 0.6)",
  },
};

export default ugstores;
