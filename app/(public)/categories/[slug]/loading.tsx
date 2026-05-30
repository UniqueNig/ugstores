import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { Skeleton, ProductGridSkeleton } from "@/src/components/ui/Skeleton";

// Shown instantly while the server fetches the category + its products.
export default function CategoryLoading() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <Skeleton className="h-64 md:h-80 w-full mt-16" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <Skeleton className="h-3 w-24 mb-8" />
        <ProductGridSkeleton count={8} />
      </div>
      <Footer />
    </main>
  );
}
