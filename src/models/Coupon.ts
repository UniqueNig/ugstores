import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // The code customers type, stored uppercased for case-insensitive matching.
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    // "percent" → value is a % off (e.g. 10 = 10%)
    // "fixed"   → value is a flat ₦ amount off
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },

    // Minimum cart subtotal required to use the coupon (0 = no minimum).
    minSubtotal: { type: Number, default: 0 },

    // Whether the coupon can currently be used.
    active: { type: Boolean, default: true },

    // Optional expiry date (null = never expires).
    expiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

const couponModel =
  mongoose.models["ugstores-coupons"] ||
  mongoose.model("ugstores-coupons", couponSchema);

export default couponModel;
