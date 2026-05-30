import type { ThemePalette } from "./types";

/**
 * "minimal" — clean and cool: pure white / neutral grey light mode, true-black
 * dark mode, with a calm slate-blue accent (instead of the warm golds). For
 * modern, understated brands (gadgets, skincare, etc.).
 */
const minimal: ThemePalette = {
  light: {
    "bg-primary": "#ffffff",
    "bg-secondary": "#f4f4f5",
    "text-primary": "#111111",
    "text-secondary": "#404040",
    "text-muted": "#a1a1aa",
    "accent": "#5b7a99",
    "accent-hover": "#496582",
    "border": "rgba(0, 0, 0, 0.1)",
    "card-bg": "#ffffff",
    "nav-bg": "rgba(255, 255, 255, 0.9)",
  },
  dark: {
    "bg-primary": "#0a0a0a",
    "bg-secondary": "#161616",
    "text-primary": "#fafafa",
    "text-secondary": "#a3a3a3",
    "text-muted": "#525252",
    "accent": "#8fb0cc",
    "accent-hover": "#aac6dd",
    "border": "rgba(255, 255, 255, 0.1)",
    "card-bg": "#141414",
    "nav-bg": "rgba(10, 10, 10, 0.9)",
  },
};

export default minimal;
