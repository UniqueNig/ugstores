"use client";

import { useState } from "react";
import { Plus, Trash2, Shield, User, X, Check, Loader2, RefreshCw } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

const GET_ADMINS = gql`
  query {
    admins {
      id name email role status createdAt
    }
  }
`;

const CREATE_ADMIN = gql`
  mutation CreateAdmin($name: String!, $email: String!, $password: String!, $role: String) {
    createAdmin(name: $name, email: $email, password: $password, role: $role) {
      id name email role status createdAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($id: ID!, $status: String!) {
    updateUserStatus(id: $id, status: $status) {
      id status
    }
  }
`;

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

export default function AdminAdminsPage() {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [newAdmin, setNewAdmin] = useState({
    name: "", email: "", password: "", role: "admin" as "admin" | "superadmin",
  });

  const { data, loading, refetch } = useQuery<{ admins: AdminUser[] }>(GET_ADMINS);
  const admins = data?.admins ?? [];

  const [createAdmin, { loading: creating }] = useMutation(CREATE_ADMIN, {
    onCompleted: () => {
      setNewAdmin({ name: "", email: "", password: "", role: "admin" });
      setShowForm(false);
      setFormError("");
      refetch();
    },
    onError: (err) => setFormError(err.message),
  });

  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    onCompleted: () => { setDeleteId(null); refetch(); },
  });

  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS, {
    onCompleted: () => refetch(),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (newAdmin.password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }
    await createAdmin({ variables: newAdmin });
  };

  const formatJoined = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all";
  const inputStyle = { backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" };
  const labelClass = "text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] block mb-1.5";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
            Admin Users
          </h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {admins.length} administrator{admins.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => { setShowForm(true); setFormError(""); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
            <Plus size={13} /> Add Admin
          </button>
        </div>
      </div>

      {/* Add admin form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 space-y-5" style={{ border: "1px solid var(--accent)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>
              Add New Administrator
            </h3>
            <button onClick={() => { setShowForm(false); setFormError(""); }} style={{ color: "var(--text-muted)" }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: "var(--text-muted)" }}>Full Name *</label>
                <input required value={newAdmin.name}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass} style={inputStyle} placeholder="John Doe" />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--text-muted)" }}>Email *</label>
                <input required type="email" value={newAdmin.email}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                  className={inputClass} style={inputStyle} placeholder="admin@ugstore.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: "var(--text-muted)" }}>Password *</label>
                <input required type="password" value={newAdmin.password}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                  className={inputClass} style={inputStyle} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--text-muted)" }}>Role</label>
                <select value={newAdmin.role}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, role: e.target.value as any }))}
                  className={inputClass} style={inputStyle}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl text-xs font-['DM_Sans'] space-y-1"
              style={{ backgroundColor: "color-mix(in srgb, var(--accent) 6%, transparent)", color: "var(--text-secondary)" }}>
              <p className="font-bold" style={{ color: "var(--accent)" }}>Permission levels:</p>
              <p>• <strong>Admin</strong> — Manage products, orders, customers and categories</p>
              <p>• <strong>Super Admin</strong> — Full access including managing other admins and settings</p>
            </div>

            {formError && (
              <p className="text-xs font-['DM_Sans'] px-3 py-2 rounded-lg border"
                style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.08)" }}>
                {formError}
              </p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setFormError(""); }}
                className="px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button type="submit" disabled={creating}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
                {creating
                  ? <><Loader2 size={12} className="animate-spin" /> Creating...</>
                  : <><Check size={12} /> Create Admin</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin" size={20} style={{ color: "var(--accent)" }} />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
{admins.map((admin, i) => (
  <div key={admin.id}
    className="px-6 py-5 flex items-center justify-between"
    style={{ borderBottom: i < admins.length - 1 ? "1px solid var(--border)" : "none" }}>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black font-['Playfair_Display'] shrink-0"
        style={{
          backgroundColor: admin.role === "superadmin"
            ? "var(--accent)"
            : "color-mix(in srgb, var(--accent) 15%, transparent)",
          color: admin.role === "superadmin" ? "#16240f" : "var(--accent)",
        }}>
        {admin.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
            {admin.name}
          </p>
          <span className="flex items-center gap-1 text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full font-bold font-['DM_Sans']"
            style={admin.role === "superadmin"
              ? { backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }
              : { backgroundColor: "color-mix(in srgb, #3b82f6 12%, transparent)", color: "#3b82f6" }}>
            {admin.role === "superadmin"
              ? <><Shield size={8} /> Super Admin</>
              : <><User size={8} /> Admin</>}
          </span>
        </div>
        <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>{admin.email}</p>
        <p className="text-[10px] font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>
          Joined {formatJoined(admin.createdAt)}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button
        onClick={() => updateUserStatus({
          variables: { id: admin.id, status: admin.status === "Active" ? "Inactive" : "Active" }
        })}
        className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans'] transition-opacity hover:opacity-70"
        style={admin.status === "Active"
          ? { backgroundColor: "color-mix(in srgb, #22c55e 12%, transparent)", color: "#22c55e" }
          : { backgroundColor: "color-mix(in srgb, #6b7280 12%, transparent)", color: "#6b7280" }}>
        {admin.status}
      </button>

      {admin.role !== "superadmin" && (
        <button onClick={() => setDeleteId(admin.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-opacity"
          style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
          <Trash2 size={13} />
        </button>
      )}
    </div>
  </div>
))}

          {admins.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No admins found</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteUser({ variables: { id: deleteId } })}
        title="Remove Admin"
        message="This administrator will lose all access to the admin panel immediately. This cannot be undone."
      />
    </div>
  );
}