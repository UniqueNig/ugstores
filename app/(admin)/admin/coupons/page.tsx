"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, Loader2, RefreshCw, Ticket } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";

const GET_COUPONS = gql`
  query GetCoupons {
    coupons {
      id
      code
      type
      value
      minSubtotal
      active
      expiresAt
      createdAt
    }
  }
`;

const CREATE_COUPON = gql`
  mutation CreateCoupon(
    $code: String!
    $type: String!
    $value: Float!
    $minSubtotal: Float
    $active: Boolean
    $expiresAt: String
  ) {
    createCoupon(
      code: $code
      type: $type
      value: $value
      minSubtotal: $minSubtotal
      active: $active
      expiresAt: $expiresAt
    ) {
      id
    }
  }
`;

const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: ID!, $active: Boolean) {
    updateCoupon(id: $id, active: $active) {
      id
      active
    }
  }
`;

const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!) {
    deleteCoupon(id: $id) {
      id
    }
  }
`;

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string | null;
};

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm font-['DM_Sans'] outline-none border transition-all";
const inputStyle = {
  backgroundColor: "var(--bg-primary)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
};
const labelClass =
  "text-[10px] tracking-widest uppercase font-bold block mb-1 font-['DM_Sans']";

export default function AdminCouponsPage() {
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minSubtotal: "",
    expiresAt: "",
  });

  const { data, loading, error, refetch } = useQuery<{ coupons: Coupon[] }>(
    GET_COUPONS,
    { fetchPolicy: "cache-and-network" },
  );

  const [createCoupon, { loading: creating }] = useMutation(CREATE_COUPON, {
    refetchQueries: ["GetCoupons"],
  });
  const [updateCoupon] = useMutation(UPDATE_COUPON, {
    refetchQueries: ["GetCoupons"],
  });
  const [deleteCoupon, { loading: deleting }] = useMutation(DELETE_COUPON, {
    refetchQueries: ["GetCoupons"],
  });

  const coupons = data?.coupons ?? [];

  const resetForm = () =>
    setForm({ code: "", type: "percent", value: "", minSubtotal: "", expiresAt: "" });

  const addCoupon = async () => {
    if (!form.code.trim() || !form.value) return;
    try {
      await createCoupon({
        variables: {
          code: form.code.trim(),
          type: form.type,
          value: parseFloat(form.value),
          minSubtotal: form.minSubtotal ? parseFloat(form.minSubtotal) : 0,
          active: true,
          expiresAt: form.expiresAt
            ? new Date(form.expiresAt).toISOString()
            : null,
        },
      });
      resetForm();
      setAdding(false);
    } catch (err) {
      console.error("Create coupon failed:", err);
      alert((err as Error).message);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await updateCoupon({ variables: { id: c.id, active: !c.active } });
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCoupon({ variables: { id: deleteId } });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
          Loading coupons...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>
          Failed to load coupons: {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
            Coupons
          </h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"}
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
        >
          <Plus size={13} /> Add Coupon
        </button>
      </div>

      {adding && (
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: "1px solid var(--accent)" }}>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>
            New Coupon
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>Code *</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER10" className={`${inputClass} uppercase`} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>Type *</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className={inputClass} style={inputStyle}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount (₦)</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>
                {form.type === "percent" ? "Percent off *" : "Amount off (₦) *"}
              </label>
              <input type="number" min="0" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "percent" ? "10" : "5000"} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>Min. subtotal (₦)</label>
              <input type="number" min="0" value={form.minSubtotal} onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))}
                placeholder="0" className={inputClass} style={inputStyle} />
            </div>
            <div className="col-span-2">
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>Expires (optional)</label>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCoupon} disabled={creating}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
              {creating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {creating ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setAdding(false); resetForm(); }}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden divide-y">
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Ticket size={28} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
              No coupons yet.
            </p>
          </div>
        ) : (
          coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
            return (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-0.5">
                    <h3 className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                      {c.code}
                    </h3>
                    <span className="text-[10px] font-['DM_Sans'] px-2.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                      {c.type === "percent" ? `${c.value}% off` : `₦${c.value.toLocaleString()} off`}
                    </span>
                    {expired && (
                      <span className="text-[10px] font-bold font-['DM_Sans']" style={{ color: "#ef4444" }}>EXPIRED</span>
                    )}
                  </div>
                  <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                    {c.minSubtotal > 0 ? `Min spend ₦${c.minSubtotal.toLocaleString()}` : "No minimum"}
                    {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleActive(c)}
                    className="text-[10px] font-bold tracking-widest uppercase font-['DM_Sans'] px-3 py-1.5 rounded-full border transition-opacity hover:opacity-70"
                    style={{
                      borderColor: c.active ? "#22c55e" : "var(--border)",
                      color: c.active ? "#22c55e" : "var(--text-muted)",
                    }}>
                    {c.active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => setDeleteId(c.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-opacity"
                    style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="This coupon will no longer work at checkout. This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
