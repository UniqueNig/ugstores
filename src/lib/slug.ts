/**
 * Slug helpers — one source of truth for turning text into URL-safe slugs.
 *
 * A "slug" is the human-readable, SEO-friendly part of a URL:
 *   "Minimalist Leather Jacket"  ->  "minimalist-leather-jacket"
 *
 * Used by: the admin product form (live preview), the createProduct /
 * updateProduct resolvers (the real value saved to the DB), and the
 * one-time backfill script.
 */

/**
 * Convert any text into a clean, lowercase, dash-separated slug.
 * - lowercases everything
 * - strips accents (é -> e) so URLs stay ASCII
 * - removes anything that isn't a letter, number, space or dash
 * - collapses spaces/underscores into single dashes
 * - trims leading/trailing dashes
 */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD") // split accented chars into base + accent
    .replace(/[̀-ͯ]/g, "") // remove the accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // drop punctuation/symbols
    .replace(/[\s_]+/g, "-") // spaces & underscores -> dash
    .replace(/-+/g, "-") // collapse repeated dashes
    .replace(/^-+|-+$/g, ""); // trim dashes from the ends
}

/**
 * Guarantee a slug is unique.
 *
 * We pass in a `taken` set/array of slugs that already exist, and if the
 * desired slug clashes we append -2, -3, ... until it's free. This is what
 * lets two products both named "Classic Tee" live at /product/classic-tee
 * and /product/classic-tee-2 instead of colliding.
 *
 * @param desired  the base slug (already slugified, or raw text)
 * @param taken    slugs that are already in use
 */
export function makeUniqueSlug(desired: string, taken: Iterable<string>): string {
  const base = slugify(desired) || "item"; // never return an empty slug
  const used = new Set(taken);

  if (!used.has(base)) return base;

  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
