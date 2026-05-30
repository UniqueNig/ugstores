/**
 * Seed U.G STORES categories into MongoDB.
 *
 * Derived from the client's intake ("What kinds of products do you sell?") +
 * her About copy (planners, gift sets), grouped into clean browsable categories.
 *
 * Idempotent — safe to re-run; existing categories (matched by slug) are skipped.
 *
 *   node scripts/seed-categories.mjs
 */
import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const CATEGORIES = [
  { name: "Journals & Planners", slug: "journals-planners", description: "Notebooks, journals and planners to keep your goals clear." },
  { name: "Bibles", slug: "bibles", description: "Bibles for study, gifting and everyday devotion." },
  { name: "Pens & Highlighters", slug: "pens-highlighters", description: "Pens, highlighters and everyday writing essentials." },
  { name: "Books", slug: "books", description: "Christian and self-help books to encourage your growth." },
  { name: "Gift Sets", slug: "gift-sets", description: "Thoughtfully assembled gift sets, ready to give." },
  { name: "Earrings", slug: "earrings", description: "Earrings to complete your look." },
  { name: "Scarves & Headwraps", slug: "scarves-headwraps", description: "Scarves and headwraps in a range of colours." },
  { name: "Berets & Fascinators", slug: "berets-fascinators", description: "Berets and fascinators for an elegant finishing touch." },
];

async function main() {
  const uri = process.env.MONGO_DB_URI;
  if (!uri) {
    console.error("❌ MONGO_DB_URI is not set (check .env.local).");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const Category =
    mongoose.models["ugstores-categories"] ||
    mongoose.model(
      "ugstores-categories",
      new mongoose.Schema({}, { strict: false, timestamps: true }),
      "ugstores-categories",
    );

  let created = 0;
  let skipped = 0;
  for (const c of CATEGORIES) {
    const res = await Category.updateOne(
      { slug: c.slug },
      { $setOnInsert: c },
      { upsert: true },
    );
    if (res.upsertedCount) {
      created++;
      console.log(`  + ${c.name}`);
    } else {
      skipped++;
      console.log(`  · ${c.name} (already exists)`);
    }
  }

  console.log(`\n✅ Done: ${created} created, ${skipped} already existed.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ seed-categories failed:", err);
  process.exit(1);
});
