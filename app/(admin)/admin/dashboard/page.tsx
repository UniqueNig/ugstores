"use client";

import { ShoppingBag, Users, Package, DollarSign, RefreshCw } from "lucide-react";
import StatCard from "@/src/components/admindashboard/StatCard";
import Link from "next/link";
import { useState, useEffect } from "react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Delivered: { bg: "color-mix(in srgb, #22c55e 12%, transparent)", color: "#22c55e" },
  Shipped:   { bg: "color-mix(in srgb, #3b82f6 12%, transparent)", color: "#3b82f6" },
  Processing:{ bg: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" },
  Pending:   { bg: "color-mix(in srgb, #f59e0b 12%, transparent)", color: "#f59e0b" },
  Failed:    { bg: "color-mix(in srgb, #ef4444 12%, transparent)", color: "#ef4444" },
  Cancelled: { bg: "color-mix(in srgb, #6b7280 12%, transparent)", color: "#6b7280" },
};

const GET_DASHBOARD = `
  query {
    orders {
      id
      shippingAddress { name email }
      items { name quantity price }
      totalAmount
      status
      isPaid
      createdAt
    }
  }
`;

const ME_QUERY = `query { me { name } }`;

type Order = {
  id: string;
  shippingAddress: { name: string; email: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
};

async function gqlFetch(query: string) {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query }),
  });
  return res.json();
}

export default function DashboardPage() {
  const [adminName, setAdminName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [meData, ordersData] = await Promise.all([
      gqlFetch(ME_QUERY),
      gqlFetch(GET_DASHBOARD),
    ]);
    if (meData?.data?.me) setAdminName(meData.data.me.name);
    if (ordersData?.data?.orders) setOrders(ordersData.data.orders);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalRevenue = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalAmount, 0);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const STATS = [
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, change: 14.2, icon: DollarSign },
    { label: "Total Orders",  value: String(orders.length), change: 8.1, icon: ShoppingBag },
    { label: "Paid Orders",   value: String(orders.filter(o => o.isPaid).length), change: 2.4, icon: Package },
    { label: "Pending",       value: String(orders.filter(o => o.status === "Pending").length), change: 0, icon: Users },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
            Good morning, {adminName || "Admin"} 👋
          </h2>
          <p className="text-sm font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>
            Here's what's happening with your store today.
          </p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border transition-opacity hover:opacity-70"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      {/* Recent orders */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
            Recent Orders
          </h3>
          <Link href="/admin/orders"
            className="text-xs tracking-widest uppercase font-['DM_Sans'] transition-opacity hover:opacity-60"
            style={{ color: "var(--accent)" }}>
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Order", "Customer", "Items", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
                      style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={order.id} style={{ borderBottom: i < recentOrders.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                        {order.shippingAddress.name}
                      </p>
                      <p className="text-[11px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                        {order.shippingAddress.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                        ₦{order.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
                        style={STATUS_STYLES[order.status] ?? STATUS_STYLES["Pending"]}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}