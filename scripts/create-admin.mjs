/**
 * Create (or promote) the FIRST admin for a store.
 *
 * Why this exists: the public sign-up always creates a normal "user", and the
 * in-app "Add admin" needs you to ALREADY be an admin — so a brand-new database
 * has no way in. Run this once to create that first admin, then use the admin
 * dashboard to add any others.
 *
 * It reads MONGO_DB_URI from .env.local and bcrypt-hashes the password (same as
 * the app), so the new admin can log in at /admin/login immediately.
 *
 * USAGE (pick one):
 *   node scripts/create-admin.mjs "Jane Doe" jane@store.com "StrongPass123"
 *   node scripts/create-admin.mjs "Jane Doe" jane@store.com "StrongPass123" superadmin
 *   npm run create:admin -- "Jane Doe" jane@store.com "StrongPass123"
 *
 * Or via env vars (ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ROLE).
 *
 * Safe to re-run: if the email already exists, it is PROMOTED to admin and its
 * password is reset to the one you pass (handy if you forget it).
 */
import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

async function main() {
  // Read from CLI args first, then env vars.
  const [, , argName, argEmail, argPassword, argRole] = process.argv;
  const name = argName || process.env.ADMIN_NAME;
  const email = (argEmail || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = argPassword || process.env.ADMIN_PASSWORD;
  // Default to the most powerful role for the very first/owner account.
  const role = (argRole || process.env.ADMIN_ROLE || "superadmin") === "admin"
    ? "admin"
    : "superadmin";

  if (!name || !email || !password) {
    console.error(
      '❌ Missing details.\n' +
      '   Usage: node scripts/create-admin.mjs "Full Name" email@store.com "password" [admin|superadmin]',
    );
    process.exit(1);
  }

  const uri = process.env.MONGO_DB_URI;
  if (!uri) {
    console.error("❌ MONGO_DB_URI is not set (check .env.local).");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Loose schema on the existing users collection (no build step needed).
  const User =
    mongoose.models["ugstores-users"] ||
    mongoose.model(
      "ugstores-users",
      // timestamps:true so newly created admins get createdAt/updatedAt, matching
      // the app's User model (the non-nullable GraphQL User.createdAt field).
      new mongoose.Schema({}, { strict: false, timestamps: true }),
      "ugstores-users",
    );

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });

  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { $set: { role, password: passwordHash, status: "Active" } },
    );
    console.log(`✅ Existing user "${email}" promoted to ${role} (password reset).`);
  } else {
    await User.create({
      name,
      email,
      password: passwordHash,
      role,
      status: "Active",
    });
    console.log(`✅ Created ${role}: ${name} <${email}>`);
  }

  console.log("➡️  Log in at /admin/login with that email + password.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ create-admin failed:", err);
  process.exit(1);
});
