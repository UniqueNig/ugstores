"use client";

import Footer from "@/src/components/layout/Footer";
import Navbar from "@/src/components/layout/Navbar";
import ShopGrid from "@/src/components/shop/ShopGrid";
import ShopHeader from "@/src/components/shop/ShopHeader";
import ShopSidebar from "@/src/components/shop/ShopSidebar";
import { useQuery } from "@apollo/client/react"; // ✅ FIXED
import gql from "graphql-tag";
import { useState, useMemo, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { ProductGridSkeleton } from "@/src/components/ui/Skeleton";

// Categories load once (rarely change). Products are fetched per page/filter.
const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
      slug
    }
  }
`;

// Server-side filtered + paginated products. The DB does the work, so the
// client never downloads the whole catalog.
const GET_PRODUCTS_PAGE = gql`
  query ProductsPage($filter: ProductFilter, $page: Int, $limit: Int) {
    productsPage(filter: $filter, page: $page, limit: $limit) {
      total
      page
      pages
      items {
        id
        slug
        name
        price
        image
        isNew
        stock
        sizes
        category {
          id
          name
          slug
        }
      }
    }
  }
`;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  isNew: boolean;
  stock: number;
  sizes: string[];
}

interface CategoriesData {
  categories: Category[];
}

interface ProductsPageData {
  productsPage: {
    total: number;
    page: number;
    pages: number;
    items: Product[];
  };
}

const PRODUCTS_PER_PAGE = 8;

export default function ShopPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  // Any filter/sort change should send us back to page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, selectedSizes, sortBy]);

  const { data: catData } = useQuery<CategoriesData>(GET_CATEGORIES);
  const categories = catData?.categories || [];

  // Build the server filter from the UI state.
  const filter = useMemo(
    () => ({
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sizes: selectedSizes,
      sort: sortBy,
    }),
    [selectedCategory, priceRange, selectedSizes, sortBy],
  );

  const { data, loading, error } = useQuery<ProductsPageData>(GET_PRODUCTS_PAGE, {
    variables: { filter, page: currentPage, limit: PRODUCTS_PER_PAGE },
    fetchPolicy: "cache-and-network", // show fresh stock on each visit
  });

  const paginated = data?.productsPage.items ?? [];
  const totalProducts = data?.productsPage.total ?? 0;
  const totalPages = data?.productsPage.pages ?? 1;

  // Only show the full-page skeleton on the very first load (no data yet).
  if (loading && !data) {
    return (
      <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 pt-28">
          <ProductGridSkeleton count={8} />
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <AlertCircle size={32} style={{ color: "#ef4444" }} />
          <p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>
            Failed to load products. Please try again.
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 pt-20">
        <div className="flex gap-10">
          <ShopSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            categories={categories} // ✅ FIXED
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
          />

          <div className="flex-1 min-w-0">
            <ShopHeader
              totalProducts={totalProducts}
              view={view}
              setView={setView}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />

            <ShopGrid
              products={paginated}
              view={view}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
