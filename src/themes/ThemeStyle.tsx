import { siteConfig } from "@/src/config/site";
import { getTheme } from "@/src/themes";
import type { ThemeTokens } from "./types";

/**
 * Emits a <style> tag that fills the CSS variables (--accent, --bg-primary, …)
 * from the theme chosen in siteConfig.theme.
 *
 * - It scopes rules to `html[data-theme="…"]`, which has higher specificity than
 *   the `:root` / `.dark` defaults in globals.css, so these always win — no
 *   reliance on stylesheet ordering.
 * - `html[data-theme="x"]`        → the theme's LIGHT palette
 * - `html[data-theme="x"].dark`   → the theme's DARK palette (next-themes adds
 *   the `.dark` class when dark mode is active)
 *
 * Rendered once in the root layout's <head>. Server component, no client JS.
 */
const toVars = (tokens: ThemeTokens) =>
  Object.entries(tokens)
    .map(([key, value]) => `--${key}:${value};`)
    .join("");

export default function ThemeStyle() {
  const name = siteConfig.theme;
  const palette = getTheme(name);
  const css =
    `html[data-theme="${name}"]{${toVars(palette.light)}}` +
    `html[data-theme="${name}"].dark{${toVars(palette.dark)}}`;

  return <style id="theme-vars" dangerouslySetInnerHTML={{ __html: css }} />;
}
