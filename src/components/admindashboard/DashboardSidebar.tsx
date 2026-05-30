"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/src/components/ui/Logo";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  LogOut,
  X,
  Package,
  Settings,
  Ticket,
  Truck,
  Star,
  Users,
  Mail,
  Boxes,
  MessageSquare,
} from "lucide-react";

type DashboardSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Customers", href: "/admin/customers", icon: User },
  { label: "Categories", href: "/admin/categories", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Shipping", href: "/admin/shipping", icon: Truck },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Profile", href: "/admin/profile", icon: User },
  { label: "Admins", href: "/admin/admins", icon: User },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // document.cookie = "token=; path=/; max-age=0";
    document.cookie = "admin_token=; Max-Age=0; path=/";

    // Redirect
    // window.location.href = "/login";
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          w-64 flex flex-col flex-shrink-0
          transition-transform duration-300 lg:transition-none
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo + close */}
        <div
          className="flex items-center justify-between px-6 h-16 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <Link href="/">
            <Logo height={32} />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden transition-opacity hover:opacity-60"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav label */}
        <div className="px-6 pt-8 pb-3">
          <p
            className="text-[9px] tracking-[0.3em] uppercase font-bold font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            Main Menu
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['DM_Sans'] transition-all duration-200 relative group"
                    style={{
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "transparent",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                    <span className={active ? "font-bold" : ""}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div
          className="px-3 py-4 border-t flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-['DM_Sans'] transition-all duration-200 hover:opacity-70"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
