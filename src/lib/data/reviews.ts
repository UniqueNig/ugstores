import "server-only";
import { connectDB } from "@/src/lib/db";
import reviewModel from "@/src/models/Review";

export type ReviewDTO = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string | null;
};

export async function getProductReviews(productId: string): Promise<ReviewDTO[]> {
  await connectDB();
  const reviews = await reviewModel.find({ product: productId }).sort({ createdAt: -1 }).lean();
  return reviews.map((r: any) => ({
    id: r._id.toString(),
    name: r.name,
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
  }));
}

export async function getReviewSummary(
  productId: string,
): Promise<{ average: number; count: number }> {
  await connectDB();
  const reviews = await reviewModel.find({ product: productId }).select("rating").lean();
  const count = reviews.length;
  const average =
    count === 0 ? 0 : reviews.reduce((s: number, r: any) => s + r.rating, 0) / count;
  return { average: Math.round(average * 10) / 10, count };
}
