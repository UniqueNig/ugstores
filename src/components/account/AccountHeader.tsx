"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import NotificationsBell from "@/src/components/ui/NotificationsBell";
// import { client } from "@/src/lib/apolloClient";

type AccountHeaderProps = {
  onMenuOpen: () => void;
};

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/orders": "My Orders",
  "/dashboard/wishlist": "Wishlist",
  "/dashboard/addresses": "Addresses",
  "/dashboard/profile": "Profile",
};

export default function AccountHeader({ onMenuOpen }: AccountHeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Account";

  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "user_token=; Max-Age=0; path=/";
    // localStorage.removeItem("user_token");
    // client.resetStore();

    router.push("/login");
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0 sticky top-0 z-30"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="lg:hidden transition-opacity hover:opacity-60"
          style={{ color: "var(--text-secondary)" }}
        >
          <Menu size={20} />
        </button>
        <h1
          className="text-lg font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>

        <Link
          href="/shop"
          className="flex lg:hidden items-center gap-2 text-xs tracking-widest uppercase font-['DM_Sans'] px-4 py-2 rounded-full border transition-opacity hover:opacity-70"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <ShoppingBag size={13} />
          Go to Shop
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Link
          href="/shop"
          className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase font-['DM_Sans'] px-4 py-2 rounded-full border transition-opacity hover:opacity-70"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <ShoppingBag size={13} />
          Continue Shopping
        </Link>
        <NotificationsBell role="user" />
        <ThemeToggle />
        <button
          onClick={handleLogout}
          // className="w-full flex items-center gap-2 px-4 py-2 text-sm font-['DM_Sans'] transition-all duration-200 hover:opacity-70"
          style={{ color: "#ef4444" }}
        >
          <LogOut size={15} />
          {/* <span>Logout</span> */}
        </button>
      </div>
    </header>
  );
}
