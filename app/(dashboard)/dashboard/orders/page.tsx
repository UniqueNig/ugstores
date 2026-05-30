"use client";

import { useEffect, useState } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import gql from "graphql-tag";

// const orders = [
//   { id: "#ORD-084", product: "Minimalist Leather Jacket", amount: 299.99, status: "Delivered", date: "Mar 20, 2025", qty: 1, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&q=80" },
//   { id: "#ORD-083", product: "Linen Blend Shirt", amount: 79.99, status: "Shipped", date: "Mar 18, 2025", qty: 2, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80" },
//   { id: "#ORD-082", product: "Tailored Cargo Pants", amount: 129.99, status: "Pending", date: "Mar 15, 2025", qty: 1, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&q=80" },
//   { id: "#ORD-081", product: "Classic Oversized Tee", amount: 49.99, status: "Paid", date: "Mar 10, 2025", qty: 3, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80" },
//   { id: "#ORD-080", product: "Wool Overcoat", amount: 349.99, status: "Failed", date: "Mar 5, 2025", qty: 1, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=100&q=80" },
//   { id: "#ORD-079", product: "Canvas Tote Bag", amount: 59.99, status: "Delivered", date: "Feb 28, 2025", qty: 1, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&q=80" },
// ];

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentReference: string | null;
  createdAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
  } | null;
}

interface GetMyOrdersResponse {
  myOrders: Order[];
}

const GET_MY_ORDERS = gql`
  query {
    myOrders {
      id
      items {
        name
        quantity
        price
        image
        size
        color
      }
      subtotal
      discount
      couponCode
      shippingCost
      totalAmount
      status
      paymentReference
      createdAt
      shippingAddress {
        name
        address
        city
        state
        phone
      }
    }
  }
`;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Delivered: {
    bg: "color-mix(in srgb, #22c55e 12%, transparent)",
    color: "#22c55e",
  },
  Shipped: {
    bg: "color-mix(in srgb, #3b82f6 12%, transparent)",
    color: "#3b82f6",
  },
  Pending: {
    bg: "color-mix(in srgb, #f59e0b 12%, transparent)",
    color: "#f59e0b",
  },
  Paid: {
    bg: "color-mix(in srgb, #22c55e 12%, transparent)",
    color: "#22c55e",
  },
  Failed: {
    bg: "color-mix(in srgb, #ef4444 12%, transparent)",
    color: "#ef4444",
  },
};

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Paid",
  "Shipped",
  "Delivered",
  "Failed",
];

export default function OrdersPage() {
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, loading } = useQuery<GetMyOrdersResponse>(GET_MY_ORDERS);
  const orders = data?.myOrders ?? [];

  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2
          className="text-2xl font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          My Orders
        </h2>
        <p
          className="text-sm font-['DM_Sans'] mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border transition-all duration-200"
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
        <div
          className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          {["Product", "Order ID", "Date", "Amount", "Status"].map((h) => (
            <p
              key={h}
              className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              {h}
            </p>
          ))}
        </div>

        {/* ← loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: "var(--accent)",
                borderTopColor: "transparent",
              }}
            />
            <p
              className="text-sm font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              Loading orders...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={32} style={{ color: "var(--text-muted)" }} />
            <p
              className="text-sm font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              No {filter === "All" ? "" : filter.toLowerCase()} orders found
            </p>
          </div>
        ) : (
          // ← use border-b on each li instead of divide-y
          <ul>
            {filtered.map((order) => {
              const expanded = expandedId === order.id;
              const firstItem = order.items[0];
              const shortId = `#${order.id.slice(-6).toUpperCase()}`;

              return (
                <li
                  key={order.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <button
                    className="w-full text-left px-6 py-4 hover:opacity-80 transition-opacity"
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                  >
                    <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
                      <div>
                        <p
                          className="text-sm font-medium font-['DM_Sans']"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {firstItem?.name ?? "Order"}
                          {order.items.length > 1 && (
                            <span
                              className="text-xs ml-2"
                              style={{ color: "var(--text-muted)" }}
                            >
                              +{order.items.length - 1} more
                            </span>
                          )}
                        </p>
                        <p
                          className="text-[11px] font-['DM_Sans'] mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                          items total
                        </p>
                      </div>
                      <p
                        className="text-xs font-bold font-['DM_Sans']"
                        style={{ color: "var(--accent)" }}
                      >
                        {shortId}
                      </p>
                      <p
                        className="text-xs font-['DM_Sans']"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p
                        className="text-sm font-bold font-['DM_Sans']"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ₦{order.totalAmount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
                          style={
                            STATUS_STYLES[order.status] ??
                            STATUS_STYLES["Pending"]
                          }
                        >
                          {order.status}
                        </span>
                        {expanded ? (
                          <ChevronUp
                            size={13}
                            style={{ color: "var(--text-muted)" }}
                          />
                        ) : (
                          <ChevronDown
                            size={13}
                            style={{ color: "var(--text-muted)" }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Mobile view */}
                    <div className="md:hidden flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium font-['DM_Sans'] truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {firstItem?.name ?? "Order"}
                        </p>
                        <p
                          className="text-xs font-['DM_Sans'] mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {shortId} ·{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-NG",
                            { day: "numeric", month: "short" },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full font-['DM_Sans']"
                          style={
                            STATUS_STYLES[order.status] ??
                            STATUS_STYLES["Pending"]
                          }
                        >
                          {order.status}
                        </span>
                        <p
                          className="text-sm font-bold font-['DM_Sans']"
                          style={{ color: "var(--text-primary)" }}
                        >
                          ₦{order.totalAmount.toLocaleString()}
                        </p>
                        {expanded ? (
                          <ChevronUp
                            size={13}
                            style={{ color: "var(--text-muted)" }}
                          />
                        ) : (
                          <ChevronDown
                            size={13}
                            style={{ color: "var(--text-muted)" }}
                          />
                        )}
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div
                      className="px-6 pb-4 pt-2 border-t"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor:
                          "color-mix(in srgb, var(--accent) 3%, transparent)",
                      }}
                    >
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-12 object-cover rounded-lg shrink-0"
                                style={{ backgroundColor: "var(--card-bg)" }}
                              />
                            ) : (
                              <div
                                className="w-10 h-12 rounded-lg shrink-0"
                                style={{ backgroundColor: "var(--border)" }}
                              />
                            )}
                            <div className="flex-1 flex justify-between">
                              <span style={{ color: "var(--text-primary)" }}>
                                {item.name} × {item.quantity}
                                {(item.color || item.size) && (
                                  <span className="block text-[11px]" style={{ color: "var(--text-muted)" }}>
                                    {[item.color && `Colour: ${item.color}`, item.size && `Size: ${item.size}`]
                                      .filter(Boolean)
                                      .join("  ·  ")}
                                  </span>
                                )}
                              </span>
                              <span style={{ color: "var(--text-secondary)" }}>
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {/* Price breakdown */}
                        <div className="border-t pt-2 space-y-1" style={{ borderColor: "var(--border)" }}>
                          <div className="flex justify-between text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                            <span>Subtotal</span>
                            <span>₦{(order.subtotal ?? 0).toLocaleString()}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-xs font-['DM_Sans']" style={{ color: "var(--accent-2)" }}>
                              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                              <span>-₦{order.discount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                            <span>Shipping</span>
                            <span>₦{(order.shippingCost ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm font-['DM_Sans'] pt-1">
                            <span style={{ color: "var(--text-primary)" }}>Total</span>
                            <span style={{ color: "var(--accent)" }}>₦{order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="border-t pt-3 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-['DM_Sans']" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                          {order.paymentReference && (
                            <div>
                              <span className="tracking-widest uppercase block mb-0.5">Payment Ref</span>
                              <span style={{ color: "var(--text-secondary)" }}>{order.paymentReference}</span>
                            </div>
                          )}
                          {order.shippingAddress && (
                            <div>
                              <span className="tracking-widest uppercase block mb-0.5">Ship To</span>
                              <span style={{ color: "var(--text-secondary)" }}>
                                {order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} · {order.shippingAddress.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
