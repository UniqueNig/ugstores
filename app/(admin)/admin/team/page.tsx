"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, Loader2, RefreshCw, Users, Upload, Edit2 } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";

const GET = gql`
  query AdminTeam { teamMembers { id name role image sortOrder } }
`;
const CREATE = gql`
  mutation CreateTeam($name: String!, $role: String, $image: String, $sortOrder: Int) {
    createTeamMember(name: $name, role: $role, image: $image, sortOrder: $sortOrder) { id }
  }
`;
const UPDATE = gql`
  mutation UpdateTeam($id: ID!, $name: String, $role: String, $image: String, $sortOrder: Int) {
    updateTeamMember(id: $id, name: $name, role: $role, image: $image, sortOrder: $sortOrder) { id }
  }
`;
const DELETE = gql`mutation DeleteTeam($id: ID!) { deleteTeamMember(id: $id) { id } }`;

type Member = { id: string; name: string; role: string; image: string; sortOrder: number };

const inputClass = "w-full px-3 py-2 rounded-lg text-sm font-['DM_Sans'] outline-none border";
const inputStyle = { backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" };
const labelClass = "text-[10px] tracking-widest uppercase font-bold block mb-1 font-['DM_Sans']";

const EMPTY = { name: "", role: "", image: "", sortOrder: "" };

export default function AdminTeamPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  const { data, loading, error, refetch } = useQuery<{ teamMembers: Member[] }>(GET, { fetchPolicy: "cache-and-network" });
  const [create, { loading: creating }] = useMutation(CREATE, { refetchQueries: ["AdminTeam"] });
  const [update, { loading: updating }] = useMutation(UPDATE, { refetchQueries: ["AdminTeam"] });
  const [del, { loading: deleting }] = useMutation(DELETE, { refetchQueries: ["AdminTeam"] });

  const members = data?.teamMembers ?? [];

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "ugstore_products");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
    const d = await res.json();
    return d.secure_url as string;
  };

  const openAdd = () => { setEditId(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (m: Member) => { setEditId(m.id); setForm({ name: m.name, role: m.role, image: m.image, sortOrder: String(m.sortOrder ?? "") }); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    const vars = { name: form.name.trim(), role: form.role.trim(), image: form.image, sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0 };
    try {
      if (editId) await update({ variables: { id: editId, ...vars } });
      else await create({ variables: vars });
      setShowForm(false); setForm(EMPTY); setEditId(null);
    } catch (e) { alert((e as Error).message); }
  };

  const handleDelete = async () => { if (deleteId) { try { await del({ variables: { id: deleteId } }); } finally { setDeleteId(null); } } };

  if (loading && members.length === 0)
    return <div className="flex items-center justify-center py-32 gap-3"><Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} /><span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Loading...</span></div>;
  if (error)
    return <div className="flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>{error.message}</p><button onClick={() => refetch()} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><RefreshCw size={13} /> Retry</button></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Team</h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>Shown on the About page</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}><Plus size={13} /> Add Member</button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: "1px solid var(--accent)" }}>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>{editId ? "Edit Member" : "New Member"}</h3>
          <div className="flex gap-4 items-start">
            <div className="w-20 h-24 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
              {form.image ? <img src={form.image} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Upload size={18} style={{ color: "var(--text-muted)" }} /></div>}
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Name *</label><input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" className={inputClass} style={inputStyle} /></div>
                <div><label className={labelClass} style={{ color: "var(--text-muted)" }}>Role</label><input value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Creative Director" className={inputClass} style={inputStyle} /></div>
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--text-muted)" }}>Photo</label>
                <input type="file" accept="image/*" className={inputClass} style={inputStyle}
                  onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { const url = await uploadImage(file); setForm(f => ({ ...f, image: url })); } catch { alert("Upload failed"); } finally { setUploading(false); } }} />
                {uploading && <p className="text-xs font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>Uploading...</p>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={creating || updating || uploading} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>{creating || updating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><X size={12} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden divide-y">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2"><Users size={28} style={{ color: "var(--text-muted)" }} /><p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No team members yet.</p></div>
        ) : members.map((m) => (
          <div key={m.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-14 overflow-hidden rounded-lg shrink-0" style={{ backgroundColor: "var(--bg-secondary)" }}>
                {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : null}
              </div>
              <div>
                <h3 className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{m.name}</h3>
                <p className="text-xs tracking-widest uppercase font-['DM_Sans']" style={{ color: "var(--accent)" }}>{m.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(m)} className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><Edit2 size={13} /></button>
              <button onClick={() => setDeleteId(m.id)} className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Team Member" message="This member will be removed from the About page." loading={deleting} />
    </div>
  );
}
