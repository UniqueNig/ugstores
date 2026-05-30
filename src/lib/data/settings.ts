import "server-only";
import { connectDB } from "@/src/lib/db";
import settingsModel from "@/src/models/Settings";
import { siteConfig } from "@/src/config/site";

/** Public, storefront-safe store settings (no secret keys). */
export async function getStoreSettings() {
  await connectDB();
  const s: any = await settingsModel.findOne();
  return {
    storeName: s?.storeName ?? siteConfig.name,
    whatsapp: s?.whatsapp ?? "",
    contactEmail: s?.contactEmail ?? "",
    currency: s?.currency ?? "NGN",
  };
}
