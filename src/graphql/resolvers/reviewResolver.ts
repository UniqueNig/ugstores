import { connectDB } from "@/src/lib/db";
import reviewModel from "@/src/models/Review";
import orderModel from "@/src/models/Order";
import userModel from "@/src/models/User";
import productModel from "@/src/models/Product";

function formatReview(r: any) {
  return {
    id: r._id.toString(),
    product: r.product?.toString() ?? null,
    productName: r.productName ?? "",
    user: r.user?.toString() ?? null,
    name: r.name,
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
  };
}

// Has this user actually bought (and paid for) this product?
async function hasPurchased(userId: string, productId: string) {
  const order = await orderModel.findOne({
    user: userId,
    isPaid: true,
    "items.product": productId,
  });
  return !!order;
}

export const reviewResolvers = {
  Query: {
    productReviews: async (_: unknown, { product }: { product: string }) => {
      await connectDB();
      const reviews = await reviewModel.find({ product }).sort({ createdAt: -1 });
      return reviews.map(formatReview);
    },

    reviewSummary: async (_: unknown, { product }: { product: string }) => {
      await connectDB();
      const reviews = await reviewModel.find({ product }).select("rating").lean();
      const count = reviews.length;
      const average =
        count === 0 ? 0 : reviews.reduce((s: number, r: any) => s + r.rating, 0) / count;
      return { average: Math.round(average * 10) / 10, count };
    },

    canReview: async (_: unknown, { product }: { product: string }, ctx: any) => {
      if (!ctx.user) return { allowed: false, reason: "Sign in to leave a review." };
      await connectDB();
      const purchased = await hasPurchased(ctx.user.id, product);
      if (!purchased)
        return { allowed: false, reason: "Only verified buyers can review this product." };
      return { allowed: true, reason: null };
    },

    adminReviews: async (_: unknown, __: unknown, ctx: any) => {
      await connectDB();
      if (!ctx.user || !["admin", "superadmin"].includes(ctx.user.role))
        throw new Error("Unauthorized");
      const reviews = await reviewModel.find().sort({ createdAt: -1 });
      return reviews.map(formatReview);
    },
  },

  Mutation: {
    createReview: async (
      _: unknown,
      { product, rating, comment }: { product: string; rating: number; comment?: string },
      ctx: any,
    ) => {
      if (!ctx.user) throw new Error("Please sign in to leave a review.");
      await connectDB();

      // 🔒 Verified-purchase gate
      const purchased = await hasPurchased(ctx.user.id, product);
      if (!purchased) throw new Error("Only verified buyers can review this product.");

      const r = Math.max(1, Math.min(5, Math.round(rating)));
      const [user, prod] = await Promise.all([
        userModel.findById(ctx.user.id).select("name"),
        productModel.findById(product).select("name"),
      ]);

      // Upsert → one review per user per product (re-submitting edits it).
      const doc = await reviewModel.findOneAndUpdate(
        { product, user: ctx.user.id },
        {
          product,
          user: ctx.user.id,
          name: user?.name ?? "Customer",
          productName: prod?.name ?? "",
          rating: r,
          comment: comment ?? "",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      return formatReview(doc);
    },

    deleteReview: async (_: unknown, { id }: { id: string }, ctx: any) => {
      if (!ctx.user) throw new Error("Not authenticated");
      await connectDB();
      const review = await reviewModel.findById(id);
      if (!review) throw new Error("Review not found");
      const isAdmin = ["admin", "superadmin"].includes(ctx.user.role);
      const isOwner = review.user?.toString() === ctx.user.id;
      if (!isAdmin && !isOwner) throw new Error("Unauthorized");
      await review.deleteOne();
      return formatReview(review);
    },
  },
};
