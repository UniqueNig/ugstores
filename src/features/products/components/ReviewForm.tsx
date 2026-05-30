"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, Check } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";
import { authHeaderValue } from "@/src/lib/clientAuth";

const CAN_REVIEW = `
  query CanReview($product: ID!) {
    canReview(product: $product) { allowed reason }
  }
`;
const CREATE_REVIEW = `
  mutation CreateReview($product: ID!, $rating: Int!, $comment: String) {
    createReview(product: $product, rating: $rating, comment: $comment) { id }
  }
`;

export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeaderValue() },
      credentials: "include",
      body: JSON.stringify({ query: CAN_REVIEW, variables: { product: productId } }),
    })
      .then((r) => r.json())
      .then((d) => setState(d?.data?.canReview ?? { allowed: false }))
      .catch(() => setState({ allowed: false }));
  }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeaderValue() },
        credentials: "include",
        body: JSON.stringify({
          query: CREATE_REVIEW,
          variables: { product: productId, rating, comment },
        }),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0].message);
      setDone(true);
      toast("Thanks for your review!", "success");
      router.refresh(); // re-fetch the server-rendered reviews list
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (state === null) return null; // still checking eligibility

  if (!state.allowed) {
    return (
      <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
        {state.reason ?? "Only verified buyers can leave a review."}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
      <h4 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
        Write a review
      </h4>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>
            <Star size={22} style={{ color: "var(--accent)" }} fill={(hover || rating) >= n ? "var(--accent)" : "none"} />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        className="w-full px-4 py-3 text-sm font-['DM_Sans'] outline-none border"
        style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)", resize: "none" }}
      />
      <button type="submit" disabled={loading || done}
        className="flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-60"
        style={{ backgroundColor: done ? "#22c55e" : "var(--accent)", color: "#000" }}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={14} /> : null}
        {done ? "Submitted" : loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
