"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Loader2, X, Plus } from "lucide-react";
import Link from "next/link";
import gql from "graphql-tag";
import { useMutation, useQuery } from "@apollo/client/react";
import { slugify } from "@/src/lib/slug";

// ── GraphQL ────────────────────────────────────────────────────────────────
const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $slug: String
    $description: String
    $price: Float
    $image: String
    $images: [String]
    $stock: Int
    $sizes: [String]
    $sizeStock: [SizeStockInput]
    $colors: [ColorInput]
    $sizeGuide: String
    $materials: String
    $sizingFit: String
    $careInstructions: String
    $category: ID!
    $isNew: Boolean
  ) {
    updateProduct(
      id: $id
      name: $name
      slug: $slug
      description: $description
      price: $price
      image: $image
      images: $images
      stock: $stock
      sizes: $sizes
      sizeStock: $sizeStock
      colors: $colors
      sizeGuide: $sizeGuide
      materials: $materials
      sizingFit: $sizingFit
      careInstructions: $careInstructions
      category: $category
      isNew: $isNew
    ) {
      id
      name
      slug
      price
      stock
      category {
        id
        name
        slug
      }
      isNew
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $slug: String
    $description: String!
    $price: Float!
    $image: String
    $images: [String]
    $stock: Int!
    $sizes: [String]
    $sizeStock: [SizeStockInput]
    $colors: [ColorInput]
    $sizeGuide: String
    $materials: String
    $sizingFit: String
    $careInstructions: String
    $category: ID!
    $isNew: Boolean
  ) {
    createProduct(
      name: $name
      slug: $slug
      description: $description
      price: $price
      image: $image
      images: $images
      stock: $stock
      sizes: $sizes
      sizeStock: $sizeStock
      colors: $colors
      sizeGuide: $sizeGuide
      materials: $materials
      sizingFit: $sizingFit
      careInstructions: $careInstructions
      category: $category
      isNew: $isNew
    ) {
      id
      name
      slug
      price
      stock
      category {
        id
        name
        slug
      }
      isNew
    }
  }
`;

type Category = { id: string; name: string; slug: string };

type ProductFormProps = {
  productId?: string;
  initialData?: {
    name?: string;
    slug?: string;
    description?: string;
    price?: string;
    stock?: string;
    sizes?: string[];
    sizeStock?: { size: string; stock: number }[];
    colors?: { name: string; hex: string; images: string[] }[];
    sizeGuide?: string;
    materials?: string;
    sizingFit?: string;
    careInstructions?: string;
    categoryId?: string; // ✅ now an ID, not a name string
    image?: string;
    images?: string[];
    isNew?: boolean;
  };
  mode: "add" | "edit";
};

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all";
// Same as inputClass but WITHOUT w-full — for inputs inside a flex row, where
// w-full fights flex-1/w-28 and collapses the field to an unclickable sliver.
const fieldClass =
  "px-4 py-3 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all";
const inputStyle = (extra = {}) => ({
  backgroundColor: "var(--bg-primary)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
  ...extra,
});
const labelClass =
  "text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] block mb-1.5";

export default function ProductForm({
  initialData = {},
  mode,
  productId,
}: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialData.name ?? "",
    slug: initialData.slug ?? "",
    description: initialData.description ?? "",
    price: initialData.price ?? "",
    stock: initialData.stock ?? "",
    sizeGuide: initialData.sizeGuide ?? "none",
    materials: initialData.materials ?? "",
    sizingFit: initialData.sizingFit ?? "",
    careInstructions: initialData.careInstructions ?? "",
    categoryId: initialData.categoryId ?? "", // ✅ stores the category _id
    isNew: initialData.isNew ?? false,
  });
  // Gallery images (first is the main image).
  const [images, setImages] = useState<string[]>(
    initialData.images?.length
      ? initialData.images
      : initialData.image
        ? [initialData.image]
        : [],
  );
  // Per-size stock rows. Empty = a non-sized product (uses the single Stock field).
  const [sizeRows, setSizeRows] = useState<{ size: string; stock: string }[]>(
    (initialData.sizeStock ?? []).map((s) => ({ size: s.size, stock: String(s.stock) })),
  );
  // Colour options, each with its own image(s). Empty = no colour picker shown.
  const [colorRows, setColorRows] = useState<
    { name: string; hex: string; images: string[] }[]
  >(
    (initialData.colors ?? []).map((c) => ({
      name: c.name,
      hex: c.hex || "#000000",
      images: c.images ?? [],
    })),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Once the admin manually edits the slug (or we're editing a product that
  // already has one), we stop auto-syncing it from the name.
  const [slugEdited, setSlugEdited] = useState(Boolean(initialData.slug));

  // ── Fetch categories from backend ──────────────────────────────────────
  const { data: catData, loading: catLoading } = useQuery<{
    categories: Category[];
  }>(GET_CATEGORIES);
  const categories: Category[] = catData?.categories ?? [];

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: ["GetProducts"],
  });
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: ["GetProducts"],
  });

  const update = (key: string, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Typing the name auto-fills the slug — until the admin edits the slug.
  const handleNameChange = (val: string) =>
    setForm((f) => ({ ...f, name: val, slug: slugEdited ? f.slug : slugify(val) }));

  // Editing the slug detaches it from the name and keeps it URL-safe.
  const handleSlugChange = (val: string) => {
    setSlugEdited(true);
    update("slug", slugify(val));
  };

  const uploadImage = async (file: File) => {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    // Preset name is configurable via env (must be NEXT_PUBLIC_ to reach the
    // browser); defaults to "ugstore_products" if unset.
    const preset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ugstore_products";
    // Surface clear, actionable errors instead of failing silently.
    if (!cloud) {
      throw new Error(
        "Cloudinary is not configured — NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing. Add it to your env (and on Vercel for the live site), then redeploy.",
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      { method: "POST", body: formData },
    );
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      // e.g. "Upload preset not found" or "...must be whitelisted for unsigned uploads"
      throw new Error(
        data?.error?.message ||
          `Cloudinary upload failed. Check that the unsigned preset '${preset}' exists and the cloud name is correct.`,
      );
    }
    return data.secure_url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Per-size stock rows → [{size, stock}]. Empty rows are dropped.
      const sizeStock = sizeRows
        .map((r) => ({ size: r.size.trim(), stock: Math.max(0, parseInt(r.stock) || 0) }))
        .filter((r) => r.size);
      const sized = sizeStock.length > 0;

      // Colour rows → [{name, hex, images}]. Nameless rows are dropped.
      const colors = colorRows
        .map((c) => ({
          name: c.name.trim(),
          hex: c.hex || "",
          images: c.images.filter(Boolean),
        }))
        .filter((c) => c.name);

      const variables = {
        name: form.name,
        slug: form.slug, // backend slugifies + guarantees uniqueness
        description: form.description,
        price: parseFloat(form.price),
        // Sized → total is the sum of size stocks (backend re-derives too).
        stock: sized
          ? sizeStock.reduce((s, r) => s + r.stock, 0)
          : parseInt(form.stock) || 0,
        sizeStock,
        colors,
        sizeGuide: form.sizeGuide,
        materials: form.materials,
        sizingFit: form.sizingFit,
        careInstructions: form.careInstructions,
        category: form.categoryId, // ✅ sending the _id
        images,
        image: images[0] ?? "",
        isNew: form.isNew,
      };

      if (mode === "edit" && productId) {
        await updateProduct({ variables: { id: productId, ...variables } });
      } else {
        await createProduct({ variables });
      }
      // NOTE: the mutations use refetchQueries:["GetProducts"] to refresh the
      // list. We intentionally do NOT call apolloClient.resetStore() here —
      // resetStore aborts in-flight queries and, racing with the navigation
      // below, surfaced a console "AbortError".
      setSaved(true);
      setTimeout(() => router.push("/admin/products"), 800);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-['DM_Sans'] hover:opacity-60 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to Products
      </Link>

      <div>
        <h2
          className="text-2xl font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          {mode === "add" ? "Add New Product" : "Edit Product"}
        </h2>
        <p
          className="text-sm font-['DM_Sans'] mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          {mode === "add"
            ? "Fill in the details to add a new product to the store."
            : "Update the product details below."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images (gallery) */}
        <div className="glass rounded-2xl p-6">
          <label className={labelClass} style={{ color: "var(--text-muted)" }}>
            Product Images
          </label>
          <div className="flex flex-wrap gap-3 items-start">
            {images.map((url, i) => (
              <div
                key={url + i}
                className="relative w-24 h-28 shrink-0 overflow-hidden rounded-xl border group"
                style={{ borderColor: i === 0 ? "var(--accent)" : "var(--border)" }}
              >
                <img src={url} alt={`image ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span
                    className="absolute bottom-0 left-0 right-0 text-[9px] text-center font-bold tracking-widest uppercase py-0.5"
                    style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
                  >
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((arr) => arr.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 text-white"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {/* Add image */}
            <label
              className="w-24 h-28 shrink-0 flex flex-col items-center justify-center gap-1 rounded-xl border cursor-pointer hover:opacity-70 transition-opacity"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
            >
              <Upload size={18} />
              <span className="text-[10px] font-['DM_Sans']">Add</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (!files.length) return;
                  setSaving(true);
                  try {
                    const urls = await Promise.all(files.map((f) => uploadImage(f)));
                    setImages((arr) => [...arr, ...urls.filter(Boolean)]);
                  } catch (err) {
                    alert((err as Error).message || "Upload failed");
                  } finally {
                    setSaving(false);
                  }
                }}
              />
            </label>
          </div>
          <p className="text-[11px] font-['DM_Sans'] mt-2" style={{ color: "var(--text-muted)" }}>
            First image is the main one (shown on cards). The rest appear in the product gallery.
            <br />
            <span style={{ color: "var(--text-secondary)" }}>
              Recommended: portrait 2:3 (e.g. 1000 × 1500px), under 5MB. Shoot all images at the same size so the gallery doesn’t jump.
            </span>{" "}
            {saving && "Uploading..."}
          </p>
        </div>

        {/* Basic info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3
            className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            Basic Information
          </h3>

          <div>
            <label
              className={labelClass}
              style={{ color: "var(--text-muted)" }}
            >
              Product Name *
            </label>
            <input
              required
              className={inputClass}
              style={inputStyle()}
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Minimalist Leather Jacket"
            />
          </div>

          {/* Slug — auto-generated from the name, but editable */}
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>
              URL Slug
            </label>
            <input
              className={inputClass}
              style={inputStyle()}
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="auto-generated-from-name"
            />
            <p
              className="text-[11px] font-['DM_Sans'] mt-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Product URL:{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                /product/{form.slug || "your-product-name"}
              </span>
            </p>
          </div>

          <div>
            <label
              className={labelClass}
              style={{ color: "var(--text-muted)" }}
            >
              Description *
            </label>
            <textarea
              required
              rows={4}
              className={inputClass}
              style={inputStyle({ resize: "none" })}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the product in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ✅ Category now fetched from backend */}
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-muted)" }}
              >
                Category *
              </label>
              <select
                required
                className={inputClass}
                style={inputStyle()}
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                disabled={catLoading}
              >
                <option value="">
                  {catLoading ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-muted)" }}
              >
                Price (₦) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                style={inputStyle()}
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-muted)" }}
              >
                Stock Quantity {sizeRows.length === 0 ? "*" : ""}
              </label>
              {sizeRows.length === 0 ? (
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  style={inputStyle()}
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  placeholder="0"
                />
              ) : (
                <div
                  className={inputClass}
                  style={inputStyle({ opacity: 0.7 })}
                >
                  {sizeRows.reduce((s, r) => s + (parseInt(r.stock) || 0), 0)} total
                  (per size below)
                </div>
              )}
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => update("isNew", e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-10 h-5 rounded-full transition-colors"
                    style={{
                      backgroundColor: form.isNew
                        ? "var(--accent)"
                        : "var(--border)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{
                        transform: form.isNew
                          ? "translateX(20px)"
                          : "translateX(0)",
                      }}
                    />
                  </div>
                </div>
                <span
                  className="text-sm font-['DM_Sans']"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Mark as New
                </span>
              </label>
            </div>
          </div>

          {/* Sizes & per-size stock */}
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>
              Sizes & Stock (optional)
            </label>
            <div className="space-y-2">
              {sizeRows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={`${fieldClass} flex-1 min-w-0`}
                    style={inputStyle()}
                    value={row.size}
                    onChange={(e) =>
                      setSizeRows((rows) =>
                        rows.map((r, idx) => (idx === i ? { ...r, size: e.target.value } : r)),
                      )
                    }
                    placeholder="Size (e.g. S, M, L  •  or 40, 41, 42 for shoes)"
                  />
                  <input
                    type="number"
                    min="0"
                    className={`${fieldClass} w-28 flex-shrink-0`}
                    style={inputStyle()}
                    value={row.stock}
                    onChange={(e) =>
                      setSizeRows((rows) =>
                        rows.map((r, idx) => (idx === i ? { ...r, stock: e.target.value } : r)),
                      )
                    }
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={() => setSizeRows((rows) => rows.filter((_, idx) => idx !== i))}
                    className="w-9 h-9 flex items-center justify-center border flex-shrink-0 hover:opacity-70"
                    style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                    aria-label="Remove size"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSizeRows((rows) => [...rows, { size: "", stock: "" }])}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              <Plus size={12} /> Add size
            </button>
            <p
              className="text-[11px] font-['DM_Sans'] mt-2"
              style={{ color: "var(--text-muted)" }}
            >
              Add a row per size with its own stock (e.g. S=3, M=5, L=4 — or shoe sizes 40, 41…). Leave empty for one-size items and use the single Stock field above.
            </p>
          </div>

          {/* Size guide type */}
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>
              Size Guide
            </label>
            <select
              className={inputClass}
              style={inputStyle()}
              value={form.sizeGuide}
              onChange={(e) => update("sizeGuide", e.target.value)}
            >
              <option value="clothing">Clothing (chest / waist / hips)</option>
              <option value="footwear">Footwear (UK / EU / US / cm)</option>
              <option value="none">None (hide size guide)</option>
            </select>
            <p className="text-[11px] font-['DM_Sans'] mt-1.5" style={{ color: "var(--text-muted)" }}>
              Which chart shows when a customer taps “Size Guide”.
            </p>
          </div>

          {/* Colours (each with its own image[s]) */}
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>
              Colours (optional)
            </label>
            <div className="space-y-4">
              {colorRows.map((row, i) => (
                <div
                  key={i}
                  className="border p-3 space-y-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex gap-2 items-center">
                    {/* Swatch / colour picker */}
                    <input
                      type="color"
                      value={row.hex || "#000000"}
                      onChange={(e) =>
                        setColorRows((rows) =>
                          rows.map((r, idx) => (idx === i ? { ...r, hex: e.target.value } : r)),
                        )
                      }
                      className="w-10 h-10 flex-shrink-0 cursor-pointer border"
                      style={{ borderColor: "var(--border)", backgroundColor: "transparent" }}
                      aria-label="Pick colour"
                    />
                    <input
                      className={`${fieldClass} flex-1 min-w-0`}
                      style={inputStyle()}
                      value={row.name}
                      onChange={(e) =>
                        setColorRows((rows) =>
                          rows.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)),
                        )
                      }
                      placeholder="Colour name (e.g. Black, Olive, Sky Blue)"
                    />
                    <button
                      type="button"
                      onClick={() => setColorRows((rows) => rows.filter((_, idx) => idx !== i))}
                      className="w-9 h-9 flex items-center justify-center border flex-shrink-0 hover:opacity-70"
                      style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                      aria-label="Remove colour"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Per-colour images */}
                  <div className="flex flex-wrap gap-2 items-start">
                    {row.images.map((url, imgIdx) => (
                      <div
                        key={url + imgIdx}
                        className="relative w-16 h-20 flex-shrink-0 overflow-hidden border"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setColorRows((rows) =>
                              rows.map((r, idx) =>
                                idx === i
                                  ? { ...r, images: r.images.filter((_, x) => x !== imgIdx) }
                                  : r,
                              ),
                            )
                          }
                          className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-black/60 text-white"
                          aria-label="Remove image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <label
                      className="w-16 h-20 flex-shrink-0 flex flex-col items-center justify-center gap-1 border cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
                    >
                      <Upload size={14} />
                      <span className="text-[9px] font-['DM_Sans']">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (!files.length) return;
                          setSaving(true);
                          try {
                            const urls = await Promise.all(files.map((f) => uploadImage(f)));
                            setColorRows((rows) =>
                              rows.map((r, idx) =>
                                idx === i
                                  ? { ...r, images: [...r.images, ...urls.filter(Boolean)] }
                                  : r,
                              ),
                            );
                          } catch (err) {
                            console.error("Upload failed:", err);
                          } finally {
                            setSaving(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setColorRows((rows) => [...rows, { name: "", hex: "#000000", images: [] }])
              }
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              <Plus size={12} /> Add colour
            </button>
            <p className="text-[11px] font-['DM_Sans'] mt-2" style={{ color: "var(--text-muted)" }}>
              Add a colour with its own photos. Picking that colour on the product page swaps the gallery. Use the same portrait 2:3 size (e.g. 1000 × 1500px) as the main images. Leave empty if the product has no colour options.
            </p>
          </div>
        </div>

        {/* Product details (optional) — shown on the product page.
            Labels mirror the storefront's renamed sections (Details / What's
            Included / Care) so the admin knows exactly where each field appears. */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3
            className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            Product Details (optional)
          </h3>
          {[
            { key: "materials", label: "Details", placeholder: "e.g. A5 hardcover journal, 200 lined pages" },
            { key: "sizingFit", label: "What's Included", placeholder: "e.g. Journal + gift box + ribbon" },
            { key: "careInstructions", label: "Care", placeholder: "e.g. Keep dry; wipe the cover gently" },
          ].map((f) => (
            <div key={f.key}>
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <textarea
                rows={2}
                className={inputClass}
                style={inputStyle({ resize: "none" })}
                value={(form as any)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <p className="text-[11px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            Leave blank to use the default text on the product page.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70 transition-opacity"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || saved}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-all disabled:opacity-60"
            style={{
              backgroundColor: saved ? "var(--accent-2)" : "var(--accent)",
              color: saved ? "#fff" : "#16240f",
            }}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            {saved
              ? "Saved!"
              : saving
                ? "Saving..."
                : mode === "add"
                  ? "Add Product"
                  : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
