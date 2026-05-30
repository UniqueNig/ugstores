"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, Loader2, RefreshCw, Star } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";

const GET = gql`
  query AdminTestimonials {
    adminTestimonials { id name location text rating active sortOrder }
  }
`;
const CREATE = gql`
  mutation CreateTestimonial($name: String!, $location: String, $text: String!, $rating: Int, $sortOrder: Int) {
    createTestimonial(name: $name, location: $location, text: $text, rating: $rating, sortOrder: $sortOrder) { id }
  }
`;
const UPDATE = gql`mutation UpdateTestimonial($id: ID!, $active: Boolean) { updateTestimonial(id: $id, active: $active) { id active } }`;
const DELETE = gql`mutation DeleteTestimonial($id: ID!) { deleteTestimonial(id: $id) { id } }`;

type T = { id: string; name: string; location: string; text: string; rating: number; active: boolean };

const inputClass = "w-full px-3 py-2 rounded-lg text-sm font-['DM_Sans'] outline-none border";
const inputStyle = { backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" };
const labelClass = "text-[10px] tracking-widest uppercase font-bold block mb-1 font-['DM_Sans']";

export default function AdminTestimonialsPage() {
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", location: "", text: "", rating: "5" });

  const { data, loading, error, refetch } = useQuery<{ adminTestimonials: T[] }>(GET, { fetchPolicy: "cache-and-network" });
  const [create, { loading: creating }] = useMutation(CREATE, { refetchQueries: ["AdminTestimonials"] });
  const [update] = useMutation(UPDATE, { refetchQueries: ["AdminTestimonials"] });
  const [del, { loading: deleting }] = useMutation(DELETE, { refetchQueries: ["AdminTestimonials"] });

  const items = data?.adminTestimonials ?? [];

  const add = async () => {
    if (!form.name.trim() || !form.text.trim()) return;
    try {
      await create({ variables: { name: form.name.trim(), location: form.location.trim(), text: form.text.trim(), rating: parseInt(form.rating) || 5, sortOrder: 0 } });
      setForm({ name: "", location: "", text: "", rating: "5" });
      setAdding(false);
    } catch (e) { alert((e as Error).message); }
  };

  const handleDelete = async () => { if (deleteId) { try { await del({ variables: { id: deleteId } }); } finally { setDeleteId(null); } } };

  if (loading && items.length === 0)
    return <div className="flex items-center justify-center py-32 gap-3"><Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} /><span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Loading...</span></div>;
  if (error)
    return <div className="flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>{error.message}</p><button onClick={() => refetch()} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><RefreshCw size={13} /> Retry</button></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Testimonials</h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>Customer reviews shown on the homepage</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}><Plus size={13} /> Add</button>
      </div>

      {adding && (
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: "1px solid var(--accent)" }}>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Name *</label><input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Adaeze N." className={inputClass} style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Location</label><input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lagos" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Rating</label>
              <select value={form.rating} onChange={(e) => setForm(f => ({ ...f, rating: e.target.value }))} className={inputClass} style={inputStyle}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
          </div>
          <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Review *</label><textarea rows={3} value={form.text} onChange={(e) => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Great products and fast delivery..." className={inputClass} style={{ ...inputStyle, resize: "none" }} /></div>
          <div className="flex gap-2">
            <button onClick={add} disabled={creating} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>{creating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save</button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><X size={12} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden divide-y">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2"><Star size={28} style={{ color: "var(--text-muted)" }} /><p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No testimonials yet.</p></div>
        ) : items.map((t) => (
          <div key={t.id} className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold font-['DM_Sans'] text-sm" style={{ color: "var(--text-primary)" }}>{t.name}</h3>
                <span className="text-[11px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>{t.location}</span>
                <span className="text-[11px]" style={{ color: "var(--accent)" }}>{"★".repeat(Math.max(1, Math.min(5, t.rating)))}</span>
              </div>
              <p className="text-xs font-['DM_Sans'] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t.text}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => update({ variables: { id: t.id, active: !t.active } })} className="text-[10px] font-bold tracking-widest uppercase font-['DM_Sans'] px-3 py-1.5 rounded-full border hover:opacity-70" style={{ borderColor: t.active ? "#22c55e" : "var(--border)", color: t.active ? "#22c55e" : "var(--text-muted)" }}>{t.active ? "Shown" : "Hidden"}</button>
              <button onClick={() => setDeleteId(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Testimonial" message="This review will be removed from the homepage." loading={deleting} />
    </div>
  );
}
