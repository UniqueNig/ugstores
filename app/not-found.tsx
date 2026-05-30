import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-10"
          style={{ backgroundColor: "var(--accent)" }} />

        <div className="relative space-y-6">
          <p className="text-[10rem] md:text-[14rem] font-black font-['Playfair_Display'] leading-none"
            style={{ color: "color-mix(in srgb, var(--text-primary) 6%, transparent)" }}>
            404
          </p>
          <div className="-mt-8 space-y-3">
            <h1 className="text-3xl md:text-5xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
              Page not found
            </h1>
            <p className="text-sm font-['DM_Sans'] max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/" className="flex items-center gap-2 px-8 py-4 text-sm font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "var(--accent)", color: "#000" }}>
              <Home size={14} /> Go Home
            </Link>
            <Link href="/shop" className="flex items-center gap-2 px-8 py-4 text-sm font-bold tracking-widest uppercase font-['DM_Sans'] border transition-opacity hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
              <ShoppingBag size={14} /> Browse Shop
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}