import { Star } from "lucide-react";
import type { ReviewDTO } from "@/src/lib/data/reviews";
import ReviewForm from "./ReviewForm";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          style={{ color: "var(--accent)" }}
          fill={value >= n ? "var(--accent)" : "none"}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({
  productId,
  reviews,
  summary,
}: {
  productId: string;
  reviews: ReviewDTO[];
  summary: { average: number; count: number };
}) {
  return (
    <div
      className="mt-20 pt-10 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <h3
          className="text-2xl font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          Customer Reviews
        </h3>
        {summary.count > 0 && (
          <div className="flex items-center gap-3">
            <Stars value={Math.round(summary.average)} size={16} />
            <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{summary.average}</strong> / 5 ·{" "}
              {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10">
        {/* Existing reviews */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
              No reviews yet. Be the first to review this product after your purchase.
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b pb-5" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                    {r.name}
                  </p>
                  <span className="text-[10px] tracking-widest uppercase font-['DM_Sans']" style={{ color: "#22c55e" }}>
                    ✓ Verified buyer
                  </span>
                </div>
                <Stars value={r.rating} />
                {r.comment && (
                  <p className="text-sm leading-relaxed font-['DM_Sans'] mt-2" style={{ color: "var(--text-secondary)" }}>
                    {r.comment}
                  </p>
                )}
                {r.createdAt && (
                  <p className="text-[11px] font-['DM_Sans'] mt-2" style={{ color: "var(--text-muted)" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Write a review (gated to verified buyers) */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ReviewForm productId={productId} />
        </div>
      </div>
    </div>
  );
}
