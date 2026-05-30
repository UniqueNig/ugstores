"use client";

import { useState } from "react";
import { Trash2, Loader2, RefreshCw, Mail, Download } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";

const GET = gql`query Subscribers { subscribers { id email createdAt } }`;
const DELETE = gql`mutation DeleteSubscriber($id: ID!) { deleteSubscriber(id: $id) { id } }`;

type Sub = { id: string; email: string; createdAt: string | null };

export default function AdminSubscribersPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery<{ subscribers: Sub[] }>(GET, { fetchPolicy: "cache-and-network" });
  const [del, { loading: deleting }] = useMutation(DELETE, { refetchQueries: ["Subscribers"] });

  const subs = data?.subscribers ?? [];

  const handleDelete = async () => { if (deleteId) { try { await del({ variables: { id: deleteId } }); } finally { setDeleteId(null); } } };

  const exportCsv = () => {
    const rows = [["Email", "Subscribed"], ...subs.map((s) => [s.email, s.createdAt ? new Date(s.createdAt).toISOString() : ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && subs.length === 0)
    return <div className="flex items-center justify-center py-32 gap-3"><Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} /><span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Loading...</span></div>;
  if (error)
    return <div className="flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>{error.message}</p><button onClick={() => refetch()} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><RefreshCw size={13} /> Retry</button></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Subscribers</h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>{subs.length} newsletter {subs.length === 1 ? "signup" : "signups"}</p>
        </div>
        {subs.length > 0 && (
          <button onClick={exportCsv} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            <Download size={13} /> Export CSV
          </button>
        )}
      </div>

      <div className="glass rounded-2xl overflow-hidden divide-y">
        {subs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2"><Mail size={28} style={{ color: "var(--text-muted)" }} /><p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No subscribers yet.</p></div>
        ) : subs.map((s) => (
          <div key={s.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{s.email}</p>
              {s.createdAt && <p className="text-[11px] font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>{new Date(s.createdAt).toLocaleDateString()}</p>}
            </div>
            <button onClick={() => setDeleteId(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Remove Subscriber" message="This email will be removed from your list." loading={deleting} />
    </div>
  );
}
