"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Logo from "../ui/Logo";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_token="))
      ?.split("=")[1];
    setIsLoggedIn(!!token);
  }, []);

  const accountHref = isLoggedIn ? "/dashboard" : "/login";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-nav" : ""
      }`}
      style={{
        boxShadow: scrolled ? "0 8px 30px rgba(22, 36, 15, 0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo — compact badge on mobile, full lockup on desktop */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="md:hidden">
              <Logo variant="badge" height={40} />
            </span>
            <span className="hidden md:inline-flex">
              <Logo height={44} />
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {["Shop", "Categories", "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm tracking-widest uppercase transition-colors duration-300 font-['DM_Sans'] hover:opacity-100"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button
              className="transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
              onClick={() => router.push("/search")}
            >
              <Search size={18} />
            </button>

            <ThemeToggle />

            <Link
              href="/cart"
              className="relative transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-['DM_Sans']"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            <Link
              href={accountHref}
              className="hidden md:block text-sm px-5 py-2 rounded-full border transition-all duration-300 tracking-widest uppercase font-['DM_Sans'] hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
            >
              {isLoggedIn ? "Dashboard" : "Account"}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden transition-colors"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-nav px-6 py-6 flex flex-col gap-5">
          {["Shop", "Categories", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm tracking-widest uppercase transition-colors font-['DM_Sans']"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link
            href={accountHref}
            className="text-sm px-5 py-2 rounded-full border transition-all duration-300 tracking-widest uppercase font-['DM_Sans'] hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
          >
            {isLoggedIn ? "Dashboard" : "Account"}
          </Link>
        </div>
      )}
    </nav>
  );
}