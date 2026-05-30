import mongoose from "mongoose";
import { siteConfig } from "@/src/config/site";

const settingsSchema = new mongoose.Schema(
  {
    storeName:     { type: String, default: siteConfig.name },
    currency:      { type: String, default: "NGN" },
    contactEmail:  { type: String, default: "" },
    whatsapp:      { type: String, default: "" },
    paystackPublicKey:  { type: String, default: "" },
    paystackSecretKey:  { type: String, default: "" },
    emailNotifs:   { type: Boolean, default: true },
    orderNotifs:   { type: Boolean, default: true },
  },
  { timestamps: true },
);

const settingsModel =
  mongoose.models["ugstores-settings"] ||
  mongoose.model("ugstores-settings", settingsSchema);

export default settingsModel;