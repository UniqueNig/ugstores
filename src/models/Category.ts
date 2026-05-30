import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // "Tops"
    slug: { type: String, required: true, unique: true }, // "tops"
    description: { type: String, default: "" }, // shown on category pages
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// export default mongoose.models.Category ||
//   mongoose.model("Category", categorySchema);

  const categoryModel =
    mongoose.models["ugstores-categories"] ||
    mongoose.model("ugstores-categories", categorySchema);

  export default categoryModel;