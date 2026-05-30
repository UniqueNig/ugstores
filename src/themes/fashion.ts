import type { ThemePalette } from "./types";

/**
 * "fashion" — the original FanMid look: warm beige in light mode, near-black in
 * dark mode, with a gold accent. This is the default theme; its values match
 * what used to live directly in globals.css, so the default site is unchanged.
 */
const fashion: ThemePalette = {
  light: {
    "bg-primary": "#f5f4f0",
    "bg-secondary": "#eeede8",
    "text-primary": "#0a0a0a",
    "text-secondary": "#4a4a4a",
    "text-muted": "#9a9a9a",
    "accent": "#b8914a",
    "accent-hover": "#a07838",
    "border": "rgba(0, 0, 0, 0.1)",
    "card-bg": "#ffffff",
    "nav-bg": "rgba(245, 244, 240, 0.95)",
  },
  dark: {
    "bg-primary": "#0a0a0a",
    "bg-secondary": "#0d0d0d",
    "text-primary": "#ffffff",
    "text-secondary": "#a0a0a0",
    "text-muted": "#505050",
    "accent": "#c8a96e",
    "accent-hover": "#e8c98e",
    "border": "rgba(255, 255, 255, 0.1)",
    "card-bg": "#111111",
    "nav-bg": "rgba(10, 10, 10, 0.95)",
  },
};

export default fashion;
