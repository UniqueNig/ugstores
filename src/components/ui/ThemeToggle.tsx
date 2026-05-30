"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  // resolvedTheme is the ACTUAL applied theme ("dark"/"light") even when the
  // setting is "system" — reading `theme` (which can be "system") is why the
  // first click appeared to do nothing.
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 flex items-center justify-center border transition-all duration-300 hover:scale-105"
      style={{
        borderColor: "var(--border)",
        color: "var(--text-secondary)",
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}