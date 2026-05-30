"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";
import { Loader2, RefreshCw, Check, Search, AlertTriangle } from "lucide-react";

const GET_PRODUCTS = gql`
  query GetInventory {
    products {
      id
      name
      image
      stock
      category { id name }
    }
  }
`;

const UPDATE_STOCK = gql`
  mutation UpdateStock($id: ID!, $stock: Int) {
    updateProduct(id: $id, stock: $stock) {
      id
      stock
    }
  }
`;

const LOW_STOCK = 5;

type Product = {
  id: string;
  name: string;
  image: string | null;
  stock: number;
  category: { id: string; name: string } | null;
};

export default function AdminInventoryPage() {
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<{ products: Product[] }>(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
  });
  const [updateStock] = useMutation(UPDATE_STOCK);

  const products = data?.products ?? [];
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const lowCount = products.filter((p) => p.stock > 0 && p.stock < LOW_STOCK).length;
  const outCount = products.filter((p) => p.stock <= 0).length;

  const save = async (id: string) => {
    const raw = edits[id];
    if (raw === undefined || raw === "") return;
    const stock = Math.max(0, parseInt(raw));
    if (Number.isNaN(stock)) return;
    setSavingId(id);
    try {
      await updateStock({ variables: { id, stock } });
      setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
      setSavedId(id);
      setTimeout(() => setSavedId((s) => (s === id ? null : s)), 1500);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading && products.length === 0)
    return <div className="flex items-center justify-center py-32 gap-3"><Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} /><span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Loading inventory...</span></div>;
  if (error)
    return <div className="flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>{error.message}</p><button onClick={() => refetch()} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}><RefreshCw size={13} /> Retry</button></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>Inventory</h2>
        <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>
          Stock falls automatically as orders are paid. Restock here.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Products", value: products.length, color: "var(--text-primary)" },
          { label: "Low stock", value: lowCount, color: "#f59e0b" },
          { label: "Out of stock", value: outCount, color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="text-3xl font-black font-['Playfair_Display']" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] tracking-widest uppercase font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="flex-1 text-sm font-['DM_Sans'] outline-none bg-transparent" style={{ color: "var(--text-primary)" }} />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No products found.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((p) => {
              const out = p.stock <= 0;
              const low = p.stock > 0 && p.stock < LOW_STOCK;
              const editVal = edits[p.id];
              const changed = editVal !== undefined && editVal !== "" && parseInt(editVal) !== p.stock;
              return (
                <div key={p.id} className="px-6 py-3 flex items-center gap-4">
                  <div className="w-10 h-12 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-['DM_Sans'] truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>{p.category?.name ?? "Uncategorized"}</p>
                  </div>

                  {/* Status */}
                  <div className="w-28 text-right">
                    {out ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase font-['DM_Sans']" style={{ color: "#ef4444" }}>
                        <AlertTriangle size={11} /> Out
                      </span>
                    ) : low ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase font-['DM_Sans']" style={{ color: "#f59e0b" }}>
                        <AlertTriangle size={11} /> Low ({p.stock})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-widest uppercase font-['DM_Sans']" style={{ color: "#22c55e" }}>In stock</span>
                    )}
                  </div>

                  {/* Edit stock */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0"
                      value={editVal ?? String(p.stock)}
                      onChange={(e) => setEdits((s) => ({ ...s, [p.id]: e.target.value }))}
                      className="w-20 px-2 py-1.5 rounded-lg text-sm font-['DM_Sans'] outline-none border text-center"
                      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    />
                    <button
                      onClick={() => save(p.id)}
                      disabled={!changed || savingId === p.id}
                      className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-30 transition-opacity"
                      style={{ backgroundColor: savedId === p.id ? "var(--accent-2)" : "var(--accent)", color: savedId === p.id ? "#fff" : "#16240f" }}
                      title="Save stock"
                    >
                      {savingId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
