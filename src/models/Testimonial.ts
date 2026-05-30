import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, default: "" },
    text: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const testimonialModel =
  mongoose.models["ugstores-testimonials"] ||
  mongoose.model("ugstores-testimonials", testimonialSchema);

export default testimonialModel;
