/**
 * One-time backfill: give every existing product a unique slug.
 *
 * Run it once after deploying the slug feature:
 *   node scripts/backfill-product-slugs.mjs
 *
 * It reads MONGO_DB_URI from .env.local, finds products that have no slug,
 * and assigns one derived from the product name (de-duplicated with -2, -3...).
 * Safe to run multiple times — products that already have a slug are skipped.
 */
import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load .env.local explicitly (Next.js stores secrets there).
dotenv.config({ path: ".env.local" });

// --- slugify: mirrors src/lib/slug.ts (kept inline so this script needs no build step) ---
function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeUniqueSlug(desired, taken) {
  const base = slugify(desired) || "product";
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

async function main() {
  const uri = process.env.MONGO_DB_URI;
  if (!uri) {
    console.error("❌ MONGO_DB_URI is not set (check .env.local).");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Minimal schema on the existing products collection.
  const Product =
    mongoose.models["ugstores-products"] ||
    mongoose.model(
      "ugstores-products",
      new mongoose.Schema({}, { strict: false }),
      "ugstores-products",
    );

  const missing = await Product.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
  })
    .select("name slug")
    .lean();

  const withSlug = await Product.find({ slug: { $nin: [null, ""] } })
    .select("slug")
    .lean();
  const taken = new Set(withSlug.map((d) => d.slug).filter(Boolean));

  let count = 0;
  for (const product of missing) {
    const slug = makeUniqueSlug(product.name, taken);
    // updateOne by _id is safe — no risk of a save() treating the doc as new.
    await Product.updateOne({ _id: product._id }, { $set: { slug } });
    taken.add(slug);
    count++;
    console.log(`  • ${product.name} -> ${slug}`);
  }

  console.log(`\n✅ Done. Backfilled ${count} product(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
