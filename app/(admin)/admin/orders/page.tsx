"use client";

import { Fragment, useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

// Update the query:
const GET_ORDERS = `
  query {
    orders {
      id
      shippingAddress { name email phone address city state }
      items { name quantity price image size color }
      totalAmount
      status
      isPaid
      paymentReference
      createdAt
    }
  }
`;

// Update the types:
type OrderItem = { name: string; quantity: number; price: number; image?: string; size?: string; color?: string };
type Order = {
  id: string;
  shippingAddress: { name: string; email: string; phone: string; address: string; city: string; state: string };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  isPaid: boolean;
  paymentReference?: string;
  createdAt: string;
};

const UPDATE_STATUS = `
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

// type OrderItem = { name: string; quantity: number; price: number };
// type Order = {
//   id: string;
//   shippingAddress: { name: string; email: string };
//   items: OrderItem[];
//   totalAmount: number;
//   status: string;
//   isPaid: boolean;
//   paymentReference?: string;
//   createdAt: string;
// };

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Delivered: {
    bg: "color-mix(in srgb, #22c55e 12%, transparent)",
    color: "#22c55e",
  },
  Shipped: {
    bg: "color-mix(in srgb, #3b82f6 12%, transparent)",
    color: "#3b82f6",
  },
  Processing: {
    bg: "color-mix(in srgb, var(--accent) 12%, transparent)",
    color: "var(--accent)",
  },
  Pending: {
    bg: "color-mix(in srgb, #f59e0b 12%, transparent)",
    color: "#f59e0b",
  },
  Failed: {
    bg: "color-mix(in srgb, #ef4444 12%, transparent)",
    color: "#ef4444",
  },
  Cancelled: {
    bg: "color-mix(in srgb, #6b7280 12%, transparent)",
    color: "#6b7280",
  },
};

const ALL_STATUSES = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Failed",
  "Cancelled",
];

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await gql(GET_ORDERS);
    if (data?.data?.orders) setOrders(data.data.orders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await gql(UPDATE_STATUS, { id, status });
  };

  const filtered = orders.filter((o) => {
    const name =
      o.shippingAddress.name.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) || o.id.includes(search);
    const matchFilter = filter === "All" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-black font-['Playfair_Display']"
            style={{ color: "var(--text-primary)" }}
          >
            Orders
          </h2>
          <p
            className="text-sm font-['DM_Sans'] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {orders.length} total orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border transition-opacity hover:opacity-70"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border transition-all"
            style={{
              backgroundColor: filter === s ? "var(--accent)" : "transparent",
              borderColor: filter === s ? "var(--accent)" : "var(--border)",
              color: filter === s ? "#16240f" : "var(--text-secondary)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {/* Search */}
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="flex-1 text-sm font-['DM_Sans'] outline-none bg-transparent"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw
              size={20}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p
              className="text-sm font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              No orders found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Order ID",
                    "Customer",
                    "Items",
                    "Amount",
                    "Status",
                    "Date",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const expanded = expandedId === order.id;
                  const customerName = order.shippingAddress.name || "Unknown Customer";
                  const shortId = `#${order.id.slice(-6).toUpperCase()}`;

                  return (
                    <Fragment key={order.id}>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-5 py-4">
                          <span
                            className="text-xs font-bold font-['DM_Sans']"
                            style={{ color: "var(--accent)" }}
                          >
                            {shortId}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p
                            className="text-sm font-medium font-['DM_Sans']"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {customerName}
                          </p>
                          <p
                            className="text-[11px] font-['DM_Sans']"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {order.shippingAddress.email}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-sm font-['DM_Sans']"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="font-bold font-['DM_Sans'] text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            ₦{order.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 font-['DM_Sans'] border-0 outline-none cursor-pointer rounded-full"
                            style={
                              STATUS_STYLES[order.status] ??
                              STATUS_STYLES["Pending"]
                            }
                          >
                            {Object.keys(STATUS_STYLES).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-xs font-['DM_Sans']"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              setExpandedId(expanded ? null : order.id)
                            }
                            style={{ color: "var(--text-muted)" }}
                          >
                            {expanded ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
{expanded && (
  <tr style={{ borderBottom: "1px solid var(--border)" }}>
    <td colSpan={7} className="px-5 py-4"
      style={{ backgroundColor: "color-mix(in srgb, var(--accent) 3%, transparent)" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Items with images */}
        <div>
          <p className="text-[10px] tracking-widest uppercase font-bold mb-3 font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}>
            Items Ordered
          </p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name}
                    className="w-10 h-12 object-cover rounded-lg shrink-0"
                    style={{ backgroundColor: "var(--card-bg)" }} />
                ) : (
                  <div className="w-10 h-12 rounded-lg shrink-0"
                    style={{ backgroundColor: "var(--border)" }} />
                )}
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </p>
                    <p className="text-[11px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                      {[item.color && `Colour: ${item.color}`, item.size && `Size: ${item.size}`, `Qty: ${item.quantity}`]
                        .filter(Boolean)
                        .join("  ·  ")}
                    </p>
                  </div>
                  <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping address + payment ref */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase font-bold mb-2 font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}>
              Shipping Address
            </p>
            <div className="space-y-0.5">
              <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                {order.shippingAddress.name}
              </p>
              <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                {order.shippingAddress.email}
              </p>
              <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                {order.shippingAddress.phone}
              </p>
              <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                {order.shippingAddress.address}
              </p>
              <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            </div>
          </div>

          {order.paymentReference && (
            <div>
              <p className="text-[10px] tracking-widest uppercase font-bold mb-1 font-['DM_Sans']"
                style={{ color: "var(--text-muted)" }}>
                Payment Reference
              </p>
              <p className="text-xs font-mono" style={{ color: "var(--accent)" }}>
                {order.paymentReference}
              </p>
            </div>
          )}
        </div>

      </div>
    </td>
  </tr>
)}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
