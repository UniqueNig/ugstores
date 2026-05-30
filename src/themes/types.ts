/**
 * The set of colour tokens every theme must define. These map 1:1 to the CSS
 * variables the UI already uses (var(--bg-primary), var(--accent), …), so
 * components don't change — only the values behind the variables do.
 *
 * Each theme provides a `light` and a `dark` palette (the dark/light toggle
 * still works exactly as before).
 *
 * Accent note: the accent colour is used BOTH as button backgrounds (with black
 * text) AND as coloured text on the page. Keep it a mid-tone in light mode and a
 * lighter tone in dark mode so it stays legible in both roles.
 */
export type ThemeTokens = {
  "bg-primary": string;
  "bg-secondary": string;
  "text-primary": string;
  "text-secondary": string;
  "text-muted": string;
  "accent": string;
  "accent-hover": string;
  "border": string;
  "card-bg": string;
  "nav-bg": string;
  // ── Optional SECOND brand accent ──────────────────────────────────────────
  // Some brands have two signature colours (e.g. U.G STORES: orange + green).
  // `accent` stays the primary CTA/highlight; `accent-2` is the secondary
  // brand colour (structure, links, success). Optional so single-accent themes
  // (fashion/luxury/minimal) don't have to define it — ThemeStyle only emits
  // the keys a theme actually provides, so `--accent-2` simply won't exist for
  // those themes, and only components that opt into it ever reference it.
  "accent-2"?: string;
  "accent-2-hover"?: string;
};

export type ThemePalette = {
  light: ThemeTokens;
  dark: ThemeTokens;
};
