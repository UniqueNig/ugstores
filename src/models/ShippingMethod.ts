import mongoose from "mongoose";

const shippingMethodSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // "Standard Delivery"
    description: { type: String, default: "" }, // "5–7 business days"
    cost: { type: Number, required: true }, // ₦ amount
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const shippingMethodModel =
  mongoose.models["ugstores-shipping-methods"] ||
  mongoose.model("ugstores-shipping-methods", shippingMethodSchema);

export default shippingMethodModel;
