"use client";

import { useState } from "react";
import { Trash2, Loader2, RefreshCw, MessageSquare } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";

const GET = gql`
  query AdminReviews {
    adminReviews { id productName name rating comment createdAt }
  }
`;
const DELETE = gql`mutation DeleteReview($id: ID!) { deleteReview(id: $id) { id } }`;

type R = { id: string; productName: string; name: string; rating: number; comment: string; createdAt: string | null };

export default function AdminReviewsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery<{ adminReviews: R[] }>(GET, { fetchPolicy: "cache-and-network" });
  const [del, { loading: deleting }] = useMutation(DELETE, { refetchQueries: ["AdminReviews"] });

  const reviews = data?.adminReviews ?? [];

  const handleDelete = async () => { if (deleteId) { try { await del({ variables: { id: deleteId } }); } finally { setDeleteId(null); } } };

  if (loading && reviews.length === 0)
    return <div className="flex items-center justify-center py-32 gap-3"><Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} /><span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Loading...</span></div>;
  if (error)
    return <div className="flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>{error.message}</p><button onClick={() => refetch()} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><RefreshCw size={13} /> Retry</button></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Reviews</h2>
        <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>
          {reviews.length} review{reviews.length === 1 ? "" : "s"} · all from verified buyers
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden divide-y">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2"><MessageSquare size={28} style={{ color: "var(--text-muted)" }} /><p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No reviews yet.</p></div>
        ) : reviews.map((r) => (
          <div key={r.id} className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px]" style={{ color: "var(--accent)" }}>{"★".repeat(Math.max(1, Math.min(5, r.rating)))}</span>
                <span className="font-bold font-['DM_Sans'] text-sm" style={{ color: "var(--text-primary)" }}>{r.name}</span>
                <span className="text-[11px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>on {r.productName || "a product"}</span>
              </div>
              {r.comment && <p className="text-xs font-['DM_Sans'] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>}
              {r.createdAt && <p className="text-[10px] font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</p>}
            </div>
            <button onClick={() => setDeleteId(r.id)} className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 shrink-0" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Review" message="This review will be removed from the product page." loading={deleting} />
    </div>
  );
}
