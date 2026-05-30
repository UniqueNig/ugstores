import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { Skeleton } from "@/src/components/ui/Skeleton";

// Shown instantly while the server fetches the product (Next.js Suspense).
export default function ProductLoading() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20">
        <Skeleton className="h-3 w-64 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          <Skeleton className="w-full aspect-square" />
          <div className="space-y-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
