/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SECTION REGISTRY — the map from a section "name" to its component.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * WHY this exists:
 *   The homepage used to hardcode the order of sections in JSX:
 *       <Hero/> <ValueProps/> <FeaturedProducts/> ...
 *   To change the order, add, or remove a section you had to edit page code.
 *
 * WHAT it solves:
 *   Here we declare a lookup table: "hero" -> Hero, "featured" -> FeaturedProducts.
 *   The homepage then just renders whatever list of names lives in site config
 *   (siteConfig.homepageSections). Reordering the homepage = reordering an array
 *   of strings — no JSX edits.
 *
 * HOW it helps reuse:
 *   Different clients can show different sections in different orders by editing
 *   ONE array. New section types are added here once, then available to every
 *   client. This is the "interchangeable frontend" half of the architecture.
 *
 * Adding a new section:
 *   1. Create the component in src/sections/.
 *   2. Import it below and add a "key": Component entry.
 *   3. Put its key in siteConfig.homepageSections (src/config/site.ts).
 */

import type { ComponentType } from "react";
import Hero from "./Hero";
import ValueProps from "./ValueProps";
import FeaturedProducts from "./FeaturedProducts";
import CategoryPreview from "./CategoryPreview";
import Testimonials from "./Testimonials";
import Newsletter from "./Newsletter";

// Each section takes no props for now. (A later phase can pass per-section
// settings here if we want configurable sections.)
export const sectionRegistry: Record<string, ComponentType> = {
  hero: Hero,
  "value-props": ValueProps,
  featured: FeaturedProducts,
  categories: CategoryPreview,
  testimonials: Testimonials,
  newsletter: Newsletter,
};

// The valid section names (handy for typing config / avoiding typos).
export type SectionKey = keyof typeof sectionRegistry;
