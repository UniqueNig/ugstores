"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";
import { MapPin, Plus, Trash2, Check, X, Loader2, Star } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";

const ADDRESS_FIELDS = `id label name phone address city state isDefault`;

const GET = gql`query MyAddresses { myAddresses { ${ADDRESS_FIELDS} } }`;
const ADD = gql`
  mutation AddAddress($input: AddressInput!) {
    addAddress(input: $input) { ${ADDRESS_FIELDS} }
  }
`;
const UPDATE = gql`
  mutation UpdateAddress($id: ID!, $input: AddressInput!) {
    updateAddress(id: $id, input: $input) { ${ADDRESS_FIELDS} }
  }
`;
const DELETE = gql`mutation DeleteAddress($id: ID!) { deleteAddress(id: $id) { ${ADDRESS_FIELDS} } }`;
const SET_DEFAULT = gql`mutation SetDefault($id: ID!) { setDefaultAddress(id: $id) { ${ADDRESS_FIELDS} } }`;

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isDefault: boolean;
};

const inputClass = "w-full px-3 py-2 rounded-lg text-sm font-['DM_Sans'] outline-none border";
const inputStyle = { backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" };
const labelCls = "text-[10px] tracking-widest uppercase font-bold block mb-1 font-['DM_Sans']";
const EMPTY = { label: "", name: "", phone: "", address: "", city: "", state: "" };

export default function AddressesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const { data, loading } = useQuery<{ myAddresses: Address[] }>(GET, { fetchPolicy: "cache-and-network" });
  const [add, { loading: adding }] = useMutation(ADD, { refetchQueries: ["MyAddresses"] });
  const [update, { loading: updating }] = useMutation(UPDATE, { refetchQueries: ["MyAddresses"] });
  const [del, { loading: deleting }] = useMutation(DELETE, { refetchQueries: ["MyAddresses"] });
  const [setDefault] = useMutation(SET_DEFAULT, { refetchQueries: ["MyAddresses"] });

  const addresses = data?.myAddresses ?? [];

  const openAdd = () => { setEditId(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (a: Address) => {
    setEditId(a.id);
    setForm({ label: a.label, name: a.name, phone: a.phone, address: a.address, city: a.city, state: a.state });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.address.trim()) return;
    try {
      if (editId) await update({ variables: { id: editId, input: form } });
      else await add({ variables: { input: form } });
      setShowForm(false); setForm(EMPTY); setEditId(null);
    } catch (e) { alert((e as Error).message); }
  };

  const handleDelete = async () => { if (deleteId) { try { await del({ variables: { id: deleteId } }); } finally { setDeleteId(null); } } };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Addresses</h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>Your saved delivery addresses</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
          <Plus size={13} /> Add Address
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: "1px solid var(--accent)" }}>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>{editId ? "Edit Address" : "New Address"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Label</label><input value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Home" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Full name *</label><input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className={inputClass} style={inputStyle} /></div>
            <div className="col-span-2"><label className={labelCls} style={{ color: "var(--text-muted)" }}>Street address *</label><input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main Street" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>City</label><input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Lagos" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>State</label><input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Lagos State" className={inputClass} style={inputStyle} /></div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Phone</label><input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234..." className={inputClass} style={inputStyle} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={adding || updating} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
              {adding || updating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading && addresses.length === 0 ? (
        <div className="flex items-center justify-center py-16 gap-3"><Loader2 size={18} className="animate-spin" style={{ color: "var(--accent)" }} /><span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Loading...</span></div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 glass rounded-2xl">
          <MapPin size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="glass rounded-2xl p-5" style={a.isDefault ? { border: "1px solid var(--accent)" } : undefined}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: "var(--accent)" }} />
                  <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{a.label || "Address"}</span>
                  {a.isDefault && <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full font-['DM_Sans']" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>Default</span>}
                </div>
              </div>
              <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{a.name}</p>
              <p className="text-xs font-['DM_Sans'] mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {a.address}{a.city ? `, ${a.city}` : ""}{a.state ? `, ${a.state}` : ""}{a.phone ? ` · ${a.phone}` : ""}
              </p>
              <div className="flex items-center gap-3 mt-4">
                {!a.isDefault && (
                  <button onClick={() => setDefault({ variables: { id: a.id } })} className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-70" style={{ color: "var(--text-muted)" }}>
                    <Star size={11} /> Set default
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="text-[10px] font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-70" style={{ color: "var(--text-secondary)" }}>Edit</button>
                <button onClick={() => setDeleteId(a.id)} className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-70" style={{ color: "#ef4444" }}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Address" message="This address will be removed from your account." loading={deleting} />
    </div>
  );
}
