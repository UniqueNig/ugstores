"use client";

import { useState } from "react";
// import { useQuery, useMutation} from "@apollo/client";
import { Search, Trash2, Eye, Loader2, RefreshCw, X } from "lucide-react";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";
import Pagination from "@/src/components/ui/Pagination";
import gql from "graphql-tag";
import { useMutation, useQuery } from "@apollo/client/react";

// ── GraphQL ────────────────────────────────────────────────────────────────
const GET_CUSTOMERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      phone
      address
      role
      status
      createdAt # used as "joined"
      orders # computed from Order collection
      spent # computed from Order collection
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
      id
      status
    }
  }
`;

// ── Types ──────────────────────────────────────────────────────────────────
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  createdAt?: string;
  orders?: number;
  spent?: number;
};

type GetUsersResponse = {
  users: User[];
};

// ── User detail modal ──────────────────────────────────────────────────────
function UserDetailModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm glass-strong rounded-3xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3
            className="font-bold font-['DM_Sans']"
            style={{ color: "var(--text-primary)" }}
          >
            Customer Details
          </h3>
          <button
            onClick={onClose}
            className="hover:opacity-60 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black font-['Playfair_Display'] shrink-0"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p
              className="font-bold font-['DM_Sans']"
              style={{ color: "var(--text-primary)" }}
            >
              {user.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full font-['DM_Sans']"
                style={
                  user.role === "admin"
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
                {user.role}
              </span>
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full font-['DM_Sans']"
                style={
                  user.status === "Active"
                    ? {
                        backgroundColor:
                          "color-mix(in srgb, #22c55e 12%, transparent)",
                        color: "#22c55e",
                      }
                    : {
                        backgroundColor:
                          "color-mix(in srgb, #6b7280 12%, transparent)",
                        color: "#6b7280",
                      }
                }
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {[
            { label: "Email", value: user.email },
            { label: "Phone", value: user.phone ?? "—" },
            { label: "Address", value: user.address ?? "—" },
            {
              label: "Joined",
              value: user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—",
            },
            { label: "Total Orders", value: String(user.orders ?? 0) },
            { label: "Total Spent", value: `₦${(user.spent ?? 0).toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                className="text-[10px] tracking-widest uppercase font-bold font-['DM_Sans']"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>
              <p
                className="text-sm font-['DM_Sans'] mt-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, loading, error, refetch } = useQuery<GetUsersResponse>(
    GET_CUSTOMERS,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    refetchQueries: ["GetUsers"],
  });
  const [updateUserStatus, { loading: toggling }] = useMutation(
    UPDATE_USER_STATUS,
    { refetchQueries: ["GetUsers"] },
  );

  const customers: User[] = data?.users ?? [];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser({ variables: { id: deleteId } });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const toggleStatus = async (user: User) => {
    const next = user.status === "Active" ? "Inactive" : "Active";
    try {
      await updateUserStatus({ variables: { id: user.id, status: next } });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading && customers.length === 0) {
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
          Loading customers...
        </span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>
          Failed to load customers: {error.message}
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

  // ── UI ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          Customers
        </h2>
        <p
          className="text-sm font-['DM_Sans'] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {customers.length} registered customers
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length },
          {
            label: "Active",
            value: customers.filter((c) => c.status === "Active").length,
          },
          {
            label: "Inactive",
            value: customers.filter((c) => c.status === "Inactive").length,
          },
          {
            label: "Total Revenue",
            value: `₦${customers.reduce((s, c) => s + (c.spent ?? 0), 0).toLocaleString()}`,
          },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p
              className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </p>
            <p
              className="text-2xl font-black font-['Playfair_Display']"
              style={{ color: "var(--text-primary)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
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
            placeholder="Search by name or email..."
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

        {paginatedCustomers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p
              className="text-sm font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              {search ? "No customers match your search." : "No customers yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Customer",
                    "Orders",
                    "Total Spent",
                    "Joined",
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
                {paginatedCustomers.map((customer, i) => (
                  <tr
                    key={customer.id}
                    style={{
                      borderBottom:
                        i < paginatedCustomers.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-['Playfair_Display'] shrink-0"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--accent) 15%, transparent)",
                            color: "var(--accent)",
                          }}
                        >
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium font-['DM_Sans']"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {customer.name}
                          </p>
                          <p
                            className="text-[11px] font-['DM_Sans']"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="px-6 py-4">
                      <span
                        className="text-sm font-['DM_Sans']"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {customer.orders ?? 0}
                      </span>
                    </td>

                    {/* Spent */}
                    <td className="px-6 py-4">
                      <span
                        className="font-bold font-['DM_Sans'] text-sm"
                        style={{ color: "var(--accent)" }}
                      >
                        ₦{(customer.spent ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-['DM_Sans']"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>

                    {/* Status — clickable toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(customer)}
                        disabled={toggling}
                        className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans'] transition-opacity hover:opacity-70 disabled:opacity-40"
                        style={
                          customer.status === "Active"
                            ? {
                                backgroundColor:
                                  "color-mix(in srgb, #22c55e 12%, transparent)",
                                color: "#22c55e",
                              }
                            : {
                                backgroundColor:
                                  "color-mix(in srgb, #6b7280 12%, transparent)",
                                color: "#6b7280",
                              }
                        }
                      >
                        {customer.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewUser(customer)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-opacity"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(customer.id)}
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

      {viewUser && (
        <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Customer"
        message="This will permanently remove this customer and all their data."
        loading={deleting}
      />
    </div>
  );
}
