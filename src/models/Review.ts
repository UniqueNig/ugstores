import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ugstores-products",
      required: true,
    },
    productName: { type: String, default: "" }, // snapshot for admin display
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ugstores-users",
      required: true,
    },
    name: { type: String, required: true }, // reviewer name snapshot
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

// One review per user per product (re-submitting updates the existing one).
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const reviewModel =
  mongoose.models["ugstores-reviews"] ||
  mongoose.model("ugstores-reviews", reviewSchema);

export default reviewModel;
