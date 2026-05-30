"use client";

import Link from "next/link";
import { ShoppingBag, Heart, MapPin, ArrowRight, Package, Loader2 } from "lucide-react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client/react";
import { useWishlist } from "@/src/context/WishlistContext";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Delivered:  { bg: "color-mix(in srgb, #22c55e 12%, transparent)", color: "#22c55e" },
  Shipped:    { bg: "color-mix(in srgb, #3b82f6 12%, transparent)", color: "#3b82f6" },
  Processing: { bg: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" },
  Pending:    { bg: "color-mix(in srgb, #f59e0b 12%, transparent)", color: "#f59e0b" },
  Failed:     { bg: "color-mix(in srgb, #ef4444 12%, transparent)", color: "#ef4444" },
};

const ME_AND_ORDERS = gql`
  query {
    me {
      id
      name
      email
    }
    myOrders {
      id
      items { name quantity price }
      totalAmount
      status
      createdAt
    }
  }
`;

type Order = {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

export default function AccountPage() {
  const { data, loading } = useQuery<{
    me: { id: string; name: string; email: string };
    myOrders: Order[];
  }>(ME_AND_ORDERS);

  const { count: wishlistCount } = useWishlist();

  const orders = data?.myOrders ?? [];
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const QUICK_LINKS = [
    { label: "My Orders", sub: "Track & manage your orders", href: "/dashboard/orders", icon: ShoppingBag, count: `${orders.length} order${orders.length !== 1 ? "s" : ""}` },
    { label: "Wishlist",  sub: "Items you've saved",         href: "/dashboard/wishlist", icon: Heart,       count: `${wishlistCount} saved` },
    { label: "Addresses", sub: "Manage delivery addresses",  href: "/dashboard/addresses", icon: MapPin,     count: "Manage" },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
          Welcome back, {data?.me?.name ?? "there"} 👋
        </h2>
        <p className="text-sm font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>
          Manage your orders, wishlist, and account details.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map(({ label, sub, href, icon: Icon, count }) => (
          <Link key={href} href={href}
            className="group glass rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}>
                <Icon size={16} />
              </div>
              <ArrowRight size={14}
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{label}</p>
              <p className="text-xs font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
            </div>
            <p className="text-[10px] tracking-widest uppercase font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>
              {count}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Package size={15} style={{ color: "var(--accent)" }} />
            <h3 className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
              Recent Orders
            </h3>
          </div>
          <Link href="/dashboard/orders"
            className="text-xs tracking-widest uppercase font-['DM_Sans'] transition-opacity hover:opacity-60"
            style={{ color: "var(--accent)" }}>
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Package size={32} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>No orders yet</p>
            <Link href="/shop"
              className="text-xs font-bold tracking-widest uppercase font-['DM_Sans'] px-5 py-2.5 rounded-full hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentOrders.map((order) => {
              const firstItem = order.items[0];
              const shortId = `#${order.id.slice(-6).toUpperCase()}`;
              const date = new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

              return (
                <div key={order.id} className="flex items-center justify-between px-6 py-4"
                  style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-xs font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>{shortId}</p>
                    <p className="text-sm font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-primary)" }}>
                      {firstItem?.name ?? "Order"}
                      {order.items.length > 1 && (
                        <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                          +{order.items.length - 1} more
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] font-['DM_Sans'] mt-0.5" style={{ color: "var(--text-muted)" }}>{date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold font-['DM_Sans'] text-sm" style={{ color: "var(--text-primary)" }}>
                      ₦{order.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-['DM_Sans']"
                      style={STATUS_STYLES[order.status] ?? STATUS_STYLES["Pending"]}>
                      {order.status}
                    </span>
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