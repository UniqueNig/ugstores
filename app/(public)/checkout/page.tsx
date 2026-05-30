"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/layout/Navbar";
import { Shield, Lock, ChevronRight, Check } from "lucide-react";
import { useCart } from "@/src/context/CartContext";
import { useCoupon } from "@/src/context/CouponContext";
import { authHeaderValue } from "@/src/lib/clientAuth";
import { trackBeginCheckout } from "@/src/lib/analytics";
import { siteConfig } from "@/src/config/site";
import Image from "next/image";
import Script from "next/script";

const STEPS = ["Details", "Shipping", "Payment"];

const VALIDATE_COUPON = `
  query ValidateCoupon($code: String!, $subtotal: Float!) {
    validateCoupon(code: $code, subtotal: $subtotal) {
      ok
      discount
      code
    }
  }
`;

const VERIFY_AND_CREATE_ORDER = `
  mutation VerifyPaymentAndCreateOrder(
    $reference: String!
    $items: [OrderItemInput!]!
    $shippingAddress: ShippingAddressInput!
    $subtotal: Float!
    $shippingCost: Float!
    $totalAmount: Float!
  ) {
    verifyPaymentAndCreateOrder(
      reference: $reference
      items: $items
      shippingAddress: $shippingAddress
      subtotal: $subtotal
      shippingCost: $shippingCost
      totalAmount: $totalAmount
    ) {
      id
      status
    }
  }
`;

const CHECK_STOCK = `
  query CheckStock($items: [StockCheckInput!]!) {
    checkStock(items: $items) {
      product
      name
      available
      requested
      ok
    }
  }
`;

const SHIPPING_QUERY = `
  query ShippingMethods {
    shippingMethods { id label description cost }
  }
`;

const MY_ADDRESSES_QUERY = `
  query MyAddresses {
    myAddresses { id label name phone address city state isDefault }
  }
`;

type ShippingOption = { id: string; label: string; description: string; cost: number };
type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isDefault: boolean;
};

const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all duration-200";
const inputStyle = { backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" };
const labelClass = "text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] block mb-1.5";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { coupon, clear: clearCoupon } = useCoupon();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", state: "",
  });

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);

  // Load admin-defined shipping methods from the DB.
  useEffect(() => {
    fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: SHIPPING_QUERY }),
    })
      .then((r) => r.json())
      .then((d) => setShippingOptions(d?.data?.shippingMethods ?? []))
      .catch(() => setShippingOptions([]));
  }, []);

  const shippingCost = shippingOptions[selectedShipping]?.cost ?? 0;
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // ✅ Auto-fill if logged in (email always; other fields only if still empty,
  // so a saved/default address isn't overwritten).
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeaderValue() },
          credentials: "include",
          body: JSON.stringify({ query: `query { me { name email phone address } }` }),
        });
        const data = await res.json();
        if (data?.data?.me) {
          const u = data.data.me;
          setForm((f) => ({
            ...f,
            email: u.email ?? f.email,
            name: f.name || u.name || "",
            phone: f.phone || u.phone || "",
            address: f.address || u.address || "",
          }));
        }
      } catch {}
    }
    fetchUser();
  }, []);

  // ✅ Load saved addresses (logged-in users) and prefill the default one.
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeaderValue() },
          credentials: "include",
          body: JSON.stringify({ query: MY_ADDRESSES_QUERY }),
        });
        const data = await res.json();
        const list: SavedAddress[] = data?.data?.myAddresses ?? [];
        setSavedAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) {
          setForm((f) => ({
            ...f,
            name: f.name || def.name || "",
            phone: f.phone || def.phone || "",
            address: f.address || def.address || "",
            city: f.city || def.city || "",
            state: f.state || def.state || "",
          }));
        }
      } catch {}
    }
    fetchAddresses();
  }, []);

  const pickAddress = (id: string) => {
    const a = savedAddresses.find((x) => x.id === id);
    if (!a) return; // "" = enter a new address → leave fields as-is
    setForm((f) => ({
      ...f,
      name: a.name,
      phone: a.phone,
      address: a.address,
      city: a.city,
      state: a.state,
    }));
  };

const handlePaystack = async () => {
  if (!form.email || !form.name || !form.phone || !form.address || !form.city || !form.state) {
    alert("Please fill all required fields");
    return;
  }

  setLoading(true);

  // 1) Confirm everything is still in stock BEFORE taking payment.
  try {
    const checkRes = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: CHECK_STOCK,
        variables: {
          items: items.map((i) => ({ product: i.id, quantity: i.quantity, size: i.size })),
        },
      }),
    });
    const checkData = await checkRes.json();
    const checks = checkData?.data?.checkStock ?? [];
    const problem = checks.find((c: { ok: boolean }) => !c.ok);
    if (problem) {
      alert(
        problem.available > 0
          ? `"${problem.name}" only has ${problem.available} left in stock. Please reduce the quantity in your cart.`
          : `"${problem.name}" is now sold out. Please remove it from your cart.`,
      );
      setLoading(false);
      return;
    }
  } catch {
    alert("Could not verify item availability. Please try again.");
    setLoading(false);
    return;
  }

  // 1b) Re-validate the coupon server-side so the amount we charge matches
  //     exactly what the server will expect (otherwise the order is rejected).
  let appliedCode: string | null = coupon?.code ?? null;
  let appliedDiscount = 0;
  if (appliedCode) {
    try {
      const cRes = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: VALIDATE_COUPON,
          variables: { code: appliedCode, subtotal },
        }),
      });
      const cData = await cRes.json();
      const v = cData?.data?.validateCoupon;
      if (v?.ok) {
        appliedDiscount = v.discount;
      } else {
        appliedCode = null; // coupon no longer valid → drop it
        clearCoupon();
      }
    } catch {
      appliedCode = null;
    }
  }

  const finalTotal = Math.max(0, subtotal - appliedDiscount) + shippingCost;
  const ref = `${siteConfig.paymentRefPrefix}-${Date.now()}`;

  // Analytics: customer is committing to pay (stock + coupon validated).
  trackBeginCheckout({
    value: finalTotal,
    items: items.reduce((n, i) => n + i.quantity, 0),
  });

  // 2) Initialize transaction via your backend, then redirect
fetch("/api/paystack/initialize", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
    body: JSON.stringify({
      email: form.email,
      amount: Math.round(finalTotal * 100),
      currency: "NGN",
      reference: ref,
      callback_url: `${window.location.origin}/order-success?ref=${ref}`,
      metadata: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        // Needed by the webhook to finalize server-side if the tab closes.
        shippingCost,
        couponCode: appliedCode,
        cart_items: JSON.stringify(items.map((i) => ({
          product: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color ?? "",
        }))),
      },
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status && data.data?.authorization_url) {
        // Save pending order info to localStorage so order-success page can finalize it
        localStorage.setItem("pending_order", JSON.stringify({
          ref,
          items: items.map((i) => ({
            product: i.id,
            name: i.name,
            image: i.image || null,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color ?? "",
          })),
          shippingAddress: {
            name: form.name,
            address: form.address,
            city: form.city,
            state: form.state,
            phone: form.phone,
            email: form.email,
          },
          subtotal,
          shippingCost,
          totalAmount: finalTotal,
          couponCode: appliedCode,
        }));

        window.location.href = data.data.authorization_url;
      } else {
        throw new Error("Failed to initialize payment");
      }
    })
    .catch((err) => {
      console.error("Payment init failed:", err);
      alert("Could not start payment. Please try again.");
      setLoading(false);
    });
};

  if (items.length === 0) {
    return (
      <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Your cart is empty</p>
          <a href="/shop" className="px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans']"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>Shop Now</a>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" /> */}
      <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-32 pb-20">
          <h1 className="text-4xl font-black font-['Playfair_Display'] mb-10" style={{ color: "var(--text-primary)" }}>
            Checkout
          </h1>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button onClick={() => i < step && setStep(i)}
                  className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase font-['DM_Sans']"
                  style={{ color: i <= step ? "var(--accent)" : "var(--text-muted)" }}>
                  <span className="w-6 h-6 flex items-center justify-center text-[10px] rounded-full border"
                    style={{
                      borderColor: i <= step ? "var(--accent)" : "var(--border)",
                      backgroundColor: i < step ? "var(--accent)" : "transparent",
                      color: i < step ? "#16240f" : i === step ? "var(--accent)" : "var(--text-muted)",
                    }}>
                    {i < step ? <Check size={10} /> : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && <ChevronRight size={12} style={{ color: "var(--border)" }} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            {/* Left — steps */}
            <div>
              {/* Step 0: Details */}
              {step === 0 && (
                <div className="glass rounded-3xl p-6 space-y-5">
                  <h2 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                    Contact Information
                  </h2>

                  {/* Saved addresses — only shown to logged-in users with any */}
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className={labelClass} style={{ color: "var(--text-muted)" }}>Use a saved address</label>
                      <select
                        className={inputClass}
                        style={inputStyle}
                        defaultValue={(savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0])?.id}
                        onChange={(e) => pickAddress(e.target.value)}
                      >
                        {savedAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {(a.label || a.address)}{a.city ? `, ${a.city}` : ""}{a.isDefault ? " (default)" : ""}
                          </option>
                        ))}
                        <option value="">— Enter a new address —</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={labelClass} style={{ color: "var(--text-muted)" }}>Full Name *</label>
                    <input className={inputClass} style={inputStyle} value={form.name}
                      onChange={(e) => update("name", e.target.value)} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: "var(--text-muted)" }}>Email Address *</label>
                    <input type="email" className={inputClass} style={inputStyle} value={form.email}
                      onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: "var(--text-muted)" }}>Phone Number *</label>
                    <input type="tel" className={inputClass} style={inputStyle} value={form.phone}
                      onChange={(e) => update("phone", e.target.value)} placeholder="+234 800 000 0000" />
                  </div>
                  <button onClick={() => setStep(1)}
                    className="w-full py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
                    Continue to Shipping
                  </button>
                </div>
              )}

              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="glass rounded-3xl p-6 space-y-5">
                  <h2 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                    Shipping Address
                  </h2>
                  <div>
                    <label className={labelClass} style={{ color: "var(--text-muted)" }}>Street Address *</label>
                    <input className={inputClass} style={inputStyle} value={form.address}
                      onChange={(e) => update("address", e.target.value)} placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: "var(--text-muted)" }}>City *</label>
                      <input className={inputClass} style={inputStyle} value={form.city}
                        onChange={(e) => update("city", e.target.value)} placeholder="Lagos" />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: "var(--text-muted)" }}>State *</label>
                      <input className={inputClass} style={inputStyle} value={form.state}
                        onChange={(e) => update("state", e.target.value)} placeholder="Lagos State" />
                    </div>
                  </div>

                  {/* Shipping options */}
                  <div>
                    <label className={labelClass} style={{ color: "var(--text-muted)" }}>Shipping Method</label>
                    <div className="space-y-2">
                      {shippingOptions.length === 0 && (
                        <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                          Loading shipping options...
                        </p>
                      )}
                      {shippingOptions.map((opt, i) => (
                        <label key={opt.id}
                          onClick={() => setSelectedShipping(i)}
                          className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors"
                          style={{
                            borderColor: selectedShipping === i ? "var(--accent)" : "var(--border)",
                            backgroundColor: selectedShipping === i ? "color-mix(in srgb, var(--accent) 5%, transparent)" : "transparent",
                          }}>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                              style={{ borderColor: "var(--accent)" }}>
                              {selectedShipping === i && (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{opt.label}</p>
                              <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>{opt.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                            ₦{opt.cost.toLocaleString()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)}
                      className="px-6 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] border transition-opacity hover:opacity-70"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                      Back
                    </button>
                    <button onClick={() => setStep(2)}
                      className="flex-1 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="glass rounded-3xl p-6 space-y-5">
                  <h2 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                    Payment
                  </h2>

                  {/* Review */}
                  <div className="p-4 rounded-2xl space-y-1" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>Paying as</p>
                    <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{form.name}</p>
                    <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>{form.email}</p>
                    <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>{form.address}, {form.city}, {form.state}</p>
                  </div>

                  <button onClick={handlePaystack} disabled={loading}
                    className="w-full flex flex-col items-center justify-center gap-1 py-5 rounded-full font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: "#0BA4DB", color: "#fff" }}>
                    <span className="flex items-center gap-2 text-sm font-['DM_Sans']">
                      <Lock size={14} />
                      {loading ? "Processing..." : `Pay ₦${total.toLocaleString()} with Paystack`}
                    </span>
                    <span className="text-[10px] font-normal tracking-widest font-['DM_Sans'] opacity-80">
                      Cards · Bank Transfer · USSD · Mobile Money
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-2">
                    <Shield size={12} style={{ color: "var(--text-muted)" }} />
                    <p className="text-[10px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                      Secured by Paystack. Your payment info is never stored.
                    </p>
                  </div>

                  <button onClick={() => setStep(1)}
                    className="w-full py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border transition-opacity hover:opacity-70"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                    Back to Shipping
                  </button>
                </div>
              )}
            </div>

            {/* Right — order summary */}
            <div className="glass-strong rounded-3xl p-6 space-y-5 sticky top-28 self-start">
              <h2 className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color ?? ""}`} className="flex gap-3">
                    <div className="relative shrink-0 w-14 h-16 overflow-hidden rounded-lg">
                      {item.image ? (
  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
) : (
  <div className="w-14 h-16" style={{ backgroundColor: "var(--card-bg)" }} />
)}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full"
                        style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                        {(item.size || item.color) && (
                          <p className="text-[11px] font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
                            {[item.color && `Colour: ${item.color}`, item.size && `Size: ${item.size}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--border)" }}>
                {[
                  { label: "Subtotal", value: `₦${subtotal.toLocaleString()}` },
                  ...(discount > 0
                    ? [{ label: `Discount${coupon?.code ? ` (${coupon.code})` : ""}`, value: `-₦${discount.toLocaleString()}` }]
                    : []),
                  { label: "Shipping", value: `₦${shippingCost.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-sm font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>{label}</span>
                    <span className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-3" style={{ borderColor: "var(--border)" }}>
                  <span className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>Total</span>
                  <span className="text-xl font-black font-['Playfair_Display']" style={{ color: "var(--accent)" }}>
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}