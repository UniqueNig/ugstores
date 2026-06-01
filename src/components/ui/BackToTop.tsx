"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button. Fades in after scrolling down a bit and
 * smooth-scrolls to the top on click. Mounted once in the root layout, so it's
 * available site-wide (stays hidden on short pages since it's scroll-gated).
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
    >
      <ArrowUp size={18} />
    </button>
  );
}
