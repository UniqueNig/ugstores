import mongoose from "mongoose";

/**
 * A customer's request to be emailed when a sold-out product (optionally a
 * specific size/colour) comes back in stock.
 *
 * One pending alert per (product + email + size + colour) — the partial unique
 * index dedupes repeat requests. Once we email the customer, the alert is
 * deleted, so re-subscribing later works naturally.
 */
const stockAlertSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ugstores-products",
      required: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  { timestamps: true },
);

// Dedupe pending alerts for the same product/email/variant.
stockAlertSchema.index(
  { product: 1, email: 1, size: 1, color: 1 },
  { unique: true },
);

const stockAlertModel =
  mongoose.models["ugstores-stockalerts"] ||
  mongoose.model("ugstores-stockalerts", stockAlertSchema);

export default stockAlertModel;
