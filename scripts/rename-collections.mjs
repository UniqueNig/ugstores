/**
 * One-time migration: rename MongoDB collections `fanmidcommerce-*` → `ugstores-*`.
 *
 * The Mongoose models were renamed in code; this moves the EXISTING data
 * (admin user, categories, etc.) into the new collection names so nothing is
 * lost. Idempotent-ish: skips a rename if the target already exists.
 *
 *   node scripts/rename-collections.mjs
 */
import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGO_DB_URI;
  if (!uri) {
    console.error("❌ MONGO_DB_URI is not set (check .env.local).");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`✅ Connected to "${db.databaseName}"`);

  const cols = await db.listCollections().toArray();
  const existing = new Set(cols.map((c) => c.name));
  const toRename = cols.filter((c) => c.name.startsWith("fanmidcommerce-"));

  if (toRename.length === 0) {
    console.log("Nothing to rename — no fanmidcommerce-* collections found.");
    await mongoose.disconnect();
    process.exit(0);
  }

  for (const c of toRename) {
    const target = c.name.replace("fanmidcommerce-", "ugstores-");
    const srcCount = await db.collection(c.name).countDocuments();

    // Target doesn't exist yet → plain rename (keeps data).
    if (!existing.has(target)) {
      await db.collection(c.name).rename(target);
      console.log(`  ✓ ${c.name} → ${target} (${srcCount} docs)`);
      continue;
    }

    // Target exists (auto-created empty by the app, or already has data).
    const tgtCount = await db.collection(target).countDocuments();

    if (srcCount === 0) {
      await db.collection(c.name).drop();
      console.log(`  · dropped empty ${c.name}`);
    } else if (tgtCount === 0) {
      await db.collection(target).drop(); // remove the empty placeholder
      await db.collection(c.name).rename(target);
      console.log(`  ✓ ${c.name} → ${target} (${srcCount} docs, replaced empty target)`);
    } else {
      // Both have data — copy source docs into target, ignore duplicates, drop source.
      const docs = await db.collection(c.name).find().toArray();
      try {
        await db.collection(target).insertMany(docs, { ordered: false });
      } catch {
        /* duplicate-key errors are fine — those docs already exist in target */
      }
      await db.collection(c.name).drop();
      console.log(`  ✓ merged ${srcCount} docs from ${c.name} → ${target}, dropped source`);
    }
  }

  console.log("\n✅ Collection rename complete.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ rename-collections failed:", err);
  process.exit(1);
});
