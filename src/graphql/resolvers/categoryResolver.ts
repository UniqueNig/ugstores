import { connectDB } from "@/src/lib/db";
import categoryModel from "@/src/models/Category";

// 🔒 Throws unless the caller is an admin/superadmin.
function requireAdmin(context: any) {
  if (!context?.user || !["admin", "superadmin"].includes(context.user.role)) {
    throw new Error("Unauthorized");
  }
}

export const categoryResolvers = {
  Category: {
    id: (parent: any) => parent._id?.toString() ?? parent.id,
    name: (parent: any) => parent.name ?? null,
    slug: (parent: any) => parent.slug ?? null,
    productCount: async (parent: any) => {
      const { default: productModel } = await import("@/src/models/Product");
      const categoryId = parent._id ?? parent.id;
      return await productModel.countDocuments({ category: categoryId });
    },
  },
  Query: {
    // NOTE: `products` and `createProduct` intentionally live ONLY in
    // productResolver now. They used to be duplicated here, and because
    // mergeResolvers lets the later file win, this barebones copy (no auth,
    // no slug) was silently overriding the real one.
    categories: async () => {
      await connectDB();
      return await categoryModel.find();
    },
  },

  Mutation: {
    createCategory: async (
      _: any,
      {
        name,
        slug,
        description,
      }: { name: string; slug: string; description?: string },
      context: any,
    ) => {
      await connectDB();
      requireAdmin(context);
      const existing = await categoryModel.findOne({ slug });
      if (existing) return existing;

      const category = await categoryModel.create({
        name,
        slug,
        description: description ?? "",
      });
      return category;
    },

    updateCategory: async (_: any, { id, name, description }: any, context: any) => {
      await connectDB();
      requireAdmin(context);
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      return await categoryModel.findByIdAndUpdate(
        id,
        { name, slug, description },
        { new: true },
      );
    },

    deleteCategory: async (_: any, { id }: { id: string }, context: any) => {
      await connectDB();
      requireAdmin(context);
      return await categoryModel.findByIdAndDelete(id);
    },
  },
};
