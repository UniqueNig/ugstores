"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Package } from "lucide-react";
import { authHeaderValue } from "@/src/lib/clientAuth";

type Role = "admin" | "user";
type OrderLite = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: { name?: string } | null;
};

const ADMIN_Q = `query { orders { id status totalAmount createdAt updatedAt shippingAddress { name } } }`;
const USER_Q = `query { myOrders { id status totalAmount createdAt updatedAt } }`;

const dot = (status: string) =>
  status === "Delivered"
    ? "#22c55e"
    : status === "Shipped"
      ? "#3b82f6"
      : status === "Failed" || status === "Cancelled"
        ? "#ef4444"
        : "var(--accent)";

const activityTime = (o: OrderLite) =>
  new Date(o.updatedAt || o.createdAt).getTime();

export default function NotificationsBell({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [seenAt, setSeenAt] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const SEEN_KEY = `fanmid_notif_seen_${role}`;

  useEffect(() => {
    const v = localStorage.getItem(SEEN_KEY);
    if (v) setSeenAt(Number(v));
  }, [SEEN_KEY]);

  useEffect(() => {
    fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeaderValue() },
      credentials: "include",
      body: JSON.stringify({ query: role === "admin" ? ADMIN_Q : USER_Q }),
    })
      .then((r) => r.json())
      .then((d) => setOrders((role === "admin" ? d?.data?.orders : d?.data?.myOrders) ?? []))
      .catch(() => {});
  }, [role]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = () => {
    const now = Date.now();
    setSeenAt(now);
    localStorage.setItem(SEEN_KEY, String(now));
  };

  const toggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      if (next) markRead(); // opening = read → the badge clears
      return next;
    });
  };

  const recent = [...orders].sort((a, b) => activityTime(b) - activityTime(a)).slice(0, 8);
  const unseen = orders.filter((o) => activityTime(o) > seenAt).length;
  const href = role === "admin" ? "/admin/orders" : "/dashboard/orders";
  const ago = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative w-9 h-9 flex items-center justify-center border transition-opacity hover:opacity-60"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unseen > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold rounded-full"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
          >
            {unseen > 9 ? "9+" : unseen}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 border z-50 shadow-lg"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
        >
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
              {role === "admin" ? "Recent Orders" : "Your Orders"}
            </span>
            <button
              onClick={markRead}
              className="text-[10px] tracking-widest uppercase font-['DM_Sans'] hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Mark read
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Package size={22} style={{ color: "var(--text-muted)" }} />
              <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                Nothing yet
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
              {recent.map((o) => {
                const isNew = activityTime(o) > seenAt;
                return (
                  <Link
                    key={o.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:opacity-80"
                    style={isNew ? { backgroundColor: "color-mix(in srgb, var(--accent) 6%, transparent)" } : undefined}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot(o.status) }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold font-['DM_Sans'] truncate" style={{ color: "var(--text-primary)" }}>
                        {role === "admin"
                          ? `${o.shippingAddress?.name ?? "Order"} · ₦${o.totalAmount.toLocaleString()}`
                          : `#${o.id.slice(-6).toUpperCase()} · ₦${o.totalAmount.toLocaleString()}`}
                      </p>
                      <p className="text-[11px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                        {o.status} · {ago(o.updatedAt || o.createdAt)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <Link
            href={href}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 border-t text-center text-[10px] tracking-widest uppercase font-bold font-['DM_Sans'] transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--accent)" }}
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
}
