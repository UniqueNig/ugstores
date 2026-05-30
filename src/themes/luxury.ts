import type { ThemePalette } from "./types";

/**
 * "luxury" — warmer and richer than fashion: ivory/cream light mode, deep warm
 * black dark mode, with a champagne-bronze accent. For high-end / premium
 * brands.
 */
const luxury: ThemePalette = {
  light: {
    "bg-primary": "#f3ece1",
    "bg-secondary": "#e8dcc9",
    "text-primary": "#1a1206",
    "text-secondary": "#4a4030",
    "text-muted": "#998b73",
    "accent": "#9c6b2f",
    "accent-hover": "#7d5526",
    "border": "rgba(60, 40, 10, 0.12)",
    "card-bg": "#fffdf8",
    "nav-bg": "rgba(243, 236, 225, 0.95)",
  },
  dark: {
    "bg-primary": "#100b06",
    "bg-secondary": "#1a130b",
    "text-primary": "#f7efe2",
    "text-secondary": "#c2b399",
    "text-muted": "#7a6c52",
    "accent": "#d9a94e",
    "accent-hover": "#f0c468",
    "border": "rgba(255, 240, 210, 0.12)",
    "card-bg": "#1c140c",
    "nav-bg": "rgba(16, 11, 6, 0.95)",
  },
};

export default luxury;
