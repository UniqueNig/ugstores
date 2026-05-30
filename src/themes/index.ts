/**
 * THEME REGISTRY — the map from a theme name to its colour palette.
 *
 * WHY: each client should be able to have a different colour identity by
 * setting ONE value (siteConfig.theme), without editing components or CSS.
 *
 * HOW it's applied: see src/themes/ThemeStyle.tsx — it turns the chosen palette
 * into CSS variables (--accent, --bg-primary, …) that the whole UI already uses.
 *
 * Adding a theme: create src/themes/<name>.ts, import it here, add it to the map.
 */
import type { ThemePalette } from "./types";
import fashion from "./fashion";
import luxury from "./luxury";
import minimal from "./minimal";
import ugstores from "./ugstores";

export const themes: Record<string, ThemePalette> = {
  fashion,
  luxury,
  minimal,
  ugstores,
};

/** Look up a theme by name, falling back to "fashion" for an unknown name. */
export function getTheme(name: string): ThemePalette {
  return themes[name] ?? fashion;
}

export type { ThemePalette, ThemeTokens } from "./types";
