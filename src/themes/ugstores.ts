import type { ThemePalette } from "./types";

/**
 * "ugstores" — the custom Apple-glass theme for U.G STORES.
 *
 * Brand colours (pulled from her logo):
 *   - Orange  #FFAA00  → primary accent: CTAs, glows, highlights
 *   - Green   #2D7427  → secondary accent (accent-2): structure, links, success
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
    "accent": "#FFAA00", // brand orange
    "accent-hover": "#E09600",
    "accent-2": "#2D7427", // brand green
    "accent-2-hover": "#235C1F",
    "border": "rgba(45, 116, 39, 0.16)", // green hairline edge
    "card-bg": "#ffffff",
    "nav-bg": "rgba(251, 251, 249, 0.7)", // glassy nav (pairs with backdrop-blur)
  },
  dark: {
    "bg-primary": "#0b0f0a", // near-black, green undertone
    "bg-secondary": "#10150d",
    "text-primary": "#f4f6f1",
    "text-secondary": "#b7c0b0",
    "text-muted": "#6b7264",
    "accent": "#FFB833", // lighter orange, legible on dark
    "accent-hover": "#FFC966",
    "accent-2": "#5BB82E", // vivid green for dark mode
    "accent-2-hover": "#79D14C",
    "border": "rgba(255, 255, 255, 0.12)",
    "card-bg": "#11160e",
    "nav-bg": "rgba(11, 15, 10, 0.6)",
  },
};

export default ugstores;
