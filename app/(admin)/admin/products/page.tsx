"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import Pagination from "@/src/components/ui/Pagination";
import { Plus, Search, Edit2, Trash2, Loader2, RefreshCw } from "lucide-react";
import gql from "graphql-tag";
// ── GraphQL ────────────────────────────────────────────────────────────────
const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      category {
        id
        name
        slug
      }
      price
      stock
      image
      isNew
       createdAt
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

interface ProductsData {
  products: {
    id: string;
    name: string;
    category: { id: string; name: string; slug: string }; // ✅ object
    price: number;
    stock: number;
    image: string;
    isNew: boolean;
     createdAt: string;
  }[];
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Seed the search box from ?q= (used by the admin header search).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const { data, loading, error, refetch } = useQuery<ProductsData>(
    GET_PRODUCTS,
    {
      fetchPolicy: "network-only",
    },
  );

  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: ["GetProducts"],
  });

  const products: any[] = data?.products ?? [];

  // ── CHANGE THIS (search filter) ────────────────────────────────────────
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase()), // ✅ .name
  );

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filtered.slice(startIndex, endIndex);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct({ variables: { id: deleteId } });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteId(null);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <Loader2
          size={20}
          className="animate-spin"
          style={{ color: "var(--accent)" }}
        />
        <span
          className="text-sm font-['DM_Sans']"
          style={{ color: "var(--text-muted)" }}
        >
          Loading products...
        </span>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>
          Failed to load products: {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-black font-['Playfair_Display']"
            style={{ color: "var(--text-primary)" }}
          >
            Products
          </h2>
          <p
            className="text-sm font-['DM_Sans'] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {products.length} total products
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
        >
          <Plus size={13} /> Add Product
        </Link>
      </div>

      {/* Table card */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Search */}
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or category..."
            className="flex-1 text-sm font-['DM_Sans'] outline-none bg-transparent"
            style={{ color: "var(--text-primary)" }}
          />
          {loading && (
            <Loader2
              size={14}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p
              className="text-sm font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              {search
                ? "No products match your search."
                : "No products yet. Add your first one!"}
            </p>
            {!search && (
              <Link
                href="/admin/products/new"
                className="text-xs font-bold tracking-widest uppercase font-['DM_Sans'] underline underline-offset-4"
                style={{ color: "var(--accent)" }}
              >
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Stock",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product, i) => (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom:
                        i < paginatedProducts.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                  >
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-12 shrink-0 overflow-hidden rounded-lg"
                          style={{ backgroundColor: "var(--bg-secondary)" }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                        <span
                          className="text-sm font-medium font-['DM_Sans']"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {product.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-['DM_Sans']"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <span
                        className="font-bold font-['DM_Sans'] text-sm"
                        style={{ color: "var(--accent)" }}
                      >
                        ₦{Number(product.price).toLocaleString()}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className="text-sm font-['DM_Sans']"
                        style={{
                          color:
                            product.stock < 5
                              ? "#ef4444"
                              : "var(--text-primary)",
                        }}
                      >
                        {product.stock}
                        {product.stock < 5 && (
                          <span className="text-[10px] ml-1">(Low)</span>
                        )}
                      </span>
                    </td>

                    {/* isNew badge */}
                    <td className="px-6 py-4">
                      <span
                        className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
                        style={
                          product.isNew
                            ? {
                                backgroundColor:
                                  "color-mix(in srgb, var(--accent) 15%, transparent)",
                                color: "var(--accent)",
                              }
                            : {
                                backgroundColor:
                                  "color-mix(in srgb, #22c55e 12%, transparent)",
                                color: "#22c55e",
                              }
                        }
                      >
                        {product.isNew ? "New" : "Active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-opacity"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Edit2 size={13} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-opacity"
                          style={{
                            borderColor: "rgba(239,68,68,0.3)",
                            color: "#ef4444",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="This will permanently remove this product from the store. This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
