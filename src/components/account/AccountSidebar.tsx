"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  LogOut,
  X,
  Heart,
  MapPin,
} from "lucide-react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client/react";
import { client } from "@/src/lib/apolloClient";
import Logo from "@/src/components/ui/Logo";

type AccountSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
};

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      phone
      address
      createdAt
    }
  }
`;

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Addresses", href: "/dashboard/addresses", icon: MapPin },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function AccountSidebar({
  isOpen,
  onClose,
}: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();


  
  // ✅ Only here inside the component
  const { data, loading: userLoading } = useQuery<{
    me: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      createdAt: string;
    };
  }>(ME_QUERY);

  const handleLogout = () => {
    // localStorage.removeItem("user_token");
    document.cookie = "user_token=; Max-Age=0; path=/";

    // ✅ OPTIONAL (refresh Apollo cache)
    // client.resetStore();
    router.push("/login");
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
            <Logo height={34} />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden transition-opacity hover:opacity-60"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div
          className="px-5 py-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black font-['Playfair_Display'] shrink-0"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
            >
              {data?.me?.name.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-bold font-['DM_Sans'] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {data?.me?.name}
              </p>
              <p
                className="text-[11px] font-['DM_Sans'] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {data?.me?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="px-6 pt-6 pb-2">
          <p
            className="text-[9px] tracking-[0.3em] uppercase font-bold font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            My Account
          </p>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['DM_Sans'] transition-all duration-200"
                    style={{
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "transparent",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                    <span className={active ? "font-bold" : ""}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div
          className="px-3 py-2 border-t flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-['DM_Sans'] transition-all duration-200 hover:opacity-70"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
