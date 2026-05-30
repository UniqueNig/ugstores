import ProductForm from "@/src/components/admindashboard/ProductForm";
import Link from "next/link";
import React from "react";

const ProductsPage = () => {
  return (
    <div>
      <ProductForm mode="add" />
    </div>
  );
};

export default ProductsPage;
