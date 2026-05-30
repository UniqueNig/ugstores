"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/src/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/src/components/ui/Skeleton";
import { useQuery } from "@apollo/client/react";
import gql from "graphql-tag";

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
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
`;

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: { id: string; name: string; slug: string } | null; // ✅ object
  isNew: boolean;
  stock: number;
  sizes: string[];
}

interface ProductsData {
  products: Product[];
}

export default function FeaturedProducts() {
  const { data, loading, error } = useQuery<ProductsData>(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
  });

  // Show only first 4 on the homepage
  const products = data?.products?.slice(0, 4) ?? [];

  return (
    <section
      className="relative py-24 px-6 lg:px-10 overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Soft brand glow */}
      <div
        className="brand-glow w-120 h-120 top-10 -right-32"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
      />
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3 font-['DM_Sans']"
              style={{ color: "var(--accent)" }}
            >
              Hand Picked
            </p>
            <h2
              className="text-4xl md:text-5xl font-black font-['Playfair_Display'] leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Featured <br />
              Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="featured-view-all glass hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm tracking-widest uppercase transition-colors font-['DM_Sans'] group"
            style={{ color: "var(--text-primary)" }}
          >
            View All
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <p
            className="text-center py-16 text-sm font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            Failed to load products.
          </p>
        )}

        {/* Products grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                category={product.category?.name ?? ""}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <p
            className="text-center py-16 text-sm font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            No products available yet.
          </p>
        )}

        {/* Mobile view all */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/shop"
            className="featured-view-all inline-flex items-center gap-2 text-sm tracking-widest uppercase transition-colors font-['DM_Sans']"
            style={{ color: "var(--text-secondary)" }}
          >
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
