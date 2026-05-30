"use client";

import ProductForm from "@/src/components/admindashboard/ProductForm";
import { useQuery } from "@apollo/client/react";
import gql from "graphql-tag";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

// ✅ category is now an object
const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      price
      image
      images
      stock
      sizes
      sizeStock { size stock }
      colors { name hex images }
      sizeGuide
      materials
      sizingFit
      careInstructions
      category {
        id
        name
        slug
      }
      isNew
    }
  }
`;

interface GetProductData {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    image: string;
    images: string[] | null;
    stock: number;
    sizes: string[] | null;
    sizeStock: { size: string; stock: number }[] | null;
    colors: { name: string; hex: string; images: string[] }[] | null;
    sizeGuide: string | null;
    materials: string | null;
    sizingFit: string | null;
    careInstructions: string | null;
    category: { id: string; name: string; slug: string };
    isNew: boolean | null;
  };
}

const EditProduct = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  const { data, loading, error } = useQuery<GetProductData>(GET_PRODUCT, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  if (!id) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
          Loading product...
        </span>
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle size={32} style={{ color: "#ef4444" }} />
        <p className="text-sm font-['DM_Sans']" style={{ color: "#ef4444" }}>
          {error ? error.message : "Product not found."}
        </p>
        <Link href="/admin/products"
          className="flex items-center gap-2 text-xs tracking-widest uppercase font-['DM_Sans'] border px-5 py-2.5 hover:opacity-70"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <ArrowLeft size={12} /> Back to Products
        </Link>
      </div>
    );
  }

  const product = data.product;

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      initialData={{
        name:        product.name,
        slug:        product.slug,
        description: product.description,
        price:       product.price.toString(),
        stock:       product.stock.toString(),
        sizes:       product.sizes ?? [],
        sizeStock:   product.sizeStock ?? [],
        colors:      product.colors ?? [],
        images:      product.images ?? (product.image ? [product.image] : []),
        sizeGuide:   product.sizeGuide ?? "clothing",
        materials:   product.materials ?? "",
        sizingFit:   product.sizingFit ?? "",
        careInstructions: product.careInstructions ?? "",
        categoryId:  product.category?.id ?? " ",   // ✅ pass the ID, not the name
        image:       product.image,
        isNew:       product.isNew ?? false,
      }}
    />
  );
};

export default EditProduct;