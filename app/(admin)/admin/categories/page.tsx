"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Loader2, RefreshCw } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import { useQuery, useMutation } from "@apollo/client/react";
import gql from "graphql-tag";

// ── GraphQL ────────────────────────────────────────────────────────────────
const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      productCount
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $slug: String!, $description: String) {
    createCategory(name: $name, slug: $slug, description: $description) {
      id
      name
      slug
      description
      productCount
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      id
      name
      slug
      description
      productCount
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;

type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  description: string;
};

export default function AdminCategoriesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [adding, setAdding]     = useState(false);
  const [newName, setNewName]   = useState("");
  const [newDesc, setNewDesc]   = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────
  const { data, loading, error, refetch } = useQuery<{ categories: Category[] }>(
    GET_CATEGORIES,
    { fetchPolicy: "cache-and-network" }
  );

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: ["GetCategories"],
  });

  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: ["GetCategories"],
  });

  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_CATEGORY, {
    refetchQueries: ["GetCategories"],
  });

  const categories: Category[] = data?.categories ?? [];

  // ── Handlers ───────────────────────────────────────────────────────────
  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description ?? "");
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await updateCategory({ variables: { id: editId, name: editName, description: editDesc } });
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setEditId(null);
    }
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().replace(/\s+/g, "-");
    try {
      await createCategory({ variables: { name: newName, slug, description: newDesc } });
      setNewName(""); setNewDesc(""); setAdding(false);
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory({ variables: { id: deleteId } });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const inputClass = "px-3 py-2 rounded-lg text-sm font-['DM_Sans'] outline-none border transition-all";
  const inputStyle = {
    backgroundColor: "var(--bg-primary)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
          Loading categories...
        </span>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>
          Failed to load categories: {error.message}
        </p>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
            Categories
          </h2>
          <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {categories.length} categories
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
          <Plus size={13} /> Add Category
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: "1px solid var(--accent)" }}>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
            style={{ color: "var(--accent)" }}>
            New Category
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-widest uppercase font-bold block mb-1 font-['DM_Sans']"
                style={{ color: "var(--text-muted)" }}>Name *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Swimwear" className={`w-full ${inputClass}`} style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase font-bold block mb-1 font-['DM_Sans']"
                style={{ color: "var(--text-muted)" }}>Description</label>
              <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description..." className={`w-full ${inputClass}`} style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCategory} disabled={creating}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
              {creating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {creating ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setAdding(false); setNewName(""); setNewDesc(""); }}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="glass rounded-2xl overflow-hidden divide-y">
        {categories.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
              No categories yet. Add your first one!
            </p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="px-6 py-4">
              {editId === cat.id ? (
                <div className="flex items-center gap-3">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className={`flex-1 ${inputClass}`} style={inputStyle} />
                  <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description..." className={`flex-1 ${inputClass}`} style={inputStyle} />
                  <button onClick={saveEdit} disabled={updating}
                    className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
                    {updating ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <h3 className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                        {cat.name}
                      </h3>
                      <span className="text-[10px] font-['DM_Sans'] px-2.5 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                        {cat.productCount ?? 0} products
                      </span>
                    </div>
                    <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                      {cat.description}
                    </p>
                    <p className="text-[10px] font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      slug: /{cat.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(cat)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-opacity"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteId(cat.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-opacity"
                      style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="All products in this category will become uncategorized. This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}