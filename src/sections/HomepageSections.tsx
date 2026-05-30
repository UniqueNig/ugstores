import { siteConfig } from "@/src/config/site";
import { sectionRegistry } from "./registry";

/**
 * Renders the homepage by walking `siteConfig.homepageSections` (an array of
 * section names) and drawing each one from the registry, in order.
 *
 * Unknown names are skipped (and logged in dev) so a typo in config can't crash
 * the page. This is a server component, so the async sections in the registry
 * (e.g. CategoryPreview, Testimonials that fetch data) just work.
 */
export default function HomepageSections() {
  return (
    <>
      {siteConfig.homepageSections.map((name, i) => {
        const Section = sectionRegistry[name];
        if (!Section) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[HomepageSections] Unknown section "${name}" — check siteConfig.homepageSections and src/sections/registry.tsx`,
            );
          }
          return null;
        }
        // key includes the index so the same section could appear twice.
        return <Section key={`${name}-${i}`} />;
      })}
    </>
  );
}
