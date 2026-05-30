"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, Loader2, RefreshCw, Truck } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";

const GET = gql`
  query AdminShipping {
    adminShippingMethods { id label description cost active sortOrder }
  }
`;
const CREATE = gql`
  mutation CreateShipping($label: String!, $description: String, $cost: Float!, $sortOrder: Int) {
    createShippingMethod(label: $label, description: $description, cost: $cost, sortOrder: $sortOrder) { id }
  }
`;
const UPDATE = gql`
  mutation UpdateShipping($id: ID!, $active: Boolean) {
    updateShippingMethod(id: $id, active: $active) { id active }
  }
`;
const DELETE = gql`
  mutation DeleteShipping($id: ID!) { deleteShippingMethod(id: $id) { id } }
`;

type Method = { id: string; label: string; description: string; cost: number; active: boolean; sortOrder: number };

const inputClass = "w-full px-3 py-2 rounded-lg text-sm font-['DM_Sans'] outline-none border";
const inputStyle = { backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" };
const labelClass = "text-[10px] tracking-widest uppercase font-bold block mb-1 font-['DM_Sans']";

export default function AdminShippingPage() {
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", description: "", cost: "", sortOrder: "" });

  const { data, loading, error, refetch } = useQuery<{ adminShippingMethods: Method[] }>(GET, { fetchPolicy: "cache-and-network" });
  const [create, { loading: creating }] = useMutation(CREATE, { refetchQueries: ["AdminShipping"] });
  const [update] = useMutation(UPDATE, { refetchQueries: ["AdminShipping"] });
  const [del, { loading: deleting }] = useMutation(DELETE, { refetchQueries: ["AdminShipping"] });

  const methods = data?.adminShippingMethods ?? [];

  const add = async () => {
    if (!form.label.trim() || form.cost === "") return;
    try {
      await create({ variables: {
        label: form.label.trim(),
        description: form.description.trim(),
        cost: parseFloat(form.cost),
        sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
      }});
      setForm({ label: "", description: "", cost: "", sortOrder: "" });
      setAdding(false);
    } catch (e) { alert((e as Error).message); }
  };

  const handleDelete = async () => { if (deleteId) { try { await del({ variables: { id: deleteId } }); } finally { setDeleteId(null); } } };

  if (loading && methods.length === 0)
    return <div className="flex items-center justify-center py-32 gap-3"><Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} /><span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Loading...</span></div>;

  if (error)
    return <div className="flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>{error.message}</p><button onClick={() => refetch()} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><RefreshCw size={13} /> Retry</button></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Shipping Methods</h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>Delivery options & fees shown at checkout</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}><Plus size={13} /> Add Method</button>
      </div>

      {adding && (
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: "1px solid var(--accent)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Label *</label><input value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Standard Delivery" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Cost (₦) *</label><input type="number" min="0" value={form.cost} onChange={(e) => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="3000" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Description</label><input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="5–7 business days" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Sort order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" className={inputClass} style={inputStyle} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} disabled={creating} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>{creating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save</button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><X size={12} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden divide-y">
        {methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2"><Truck size={28} style={{ color: "var(--text-muted)" }} /><p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No shipping methods. Add one to enable checkout.</p></div>
        ) : methods.map((m) => (
          <div key={m.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{m.label}</h3>
                <span className="font-bold font-['DM_Sans'] text-sm" style={{ color: "var(--accent)" }}>₦{m.cost.toLocaleString()}</span>
              </div>
              <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>{m.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => update({ variables: { id: m.id, active: !m.active } })} className="text-[10px] font-bold tracking-widest uppercase font-['DM_Sans'] px-3 py-1.5 rounded-full border hover:opacity-70" style={{ borderColor: m.active ? "#22c55e" : "var(--border)", color: m.active ? "#22c55e" : "var(--text-muted)" }}>{m.active ? "Active" : "Inactive"}</button>
              <button onClick={() => setDeleteId(m.id)} className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Shipping Method" message="This option will no longer appear at checkout." loading={deleting} />
    </div>
  );
}
