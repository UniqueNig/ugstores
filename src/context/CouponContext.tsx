"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useToast } from "@/src/context/ToastContext";

const VALIDATE_QUERY = `
  query ValidateCoupon($code: String!, $subtotal: Float!) {
    validateCoupon(code: $code, subtotal: $subtotal) {
      ok
      message
      code
      discount
    }
  }
`;

type AppliedCoupon = { code: string; discount: number } | null;

type CouponContextType = {
  coupon: AppliedCoupon;
  /** Validate a code against the current subtotal (server-side) and apply it. */
  apply: (code: string, subtotal: number) => Promise<{ ok: boolean; message: string }>;
  /** Re-validate the applied code (e.g. after the cart subtotal changes). */
  refresh: (subtotal: number) => Promise<void>;
  clear: () => void;
};

const CouponContext = createContext<CouponContextType | null>(null);
const STORAGE_KEY = "fanmid_coupon";

async function validateOnServer(code: string, subtotal: number) {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: VALIDATE_QUERY,
      variables: { code, subtotal },
    }),
  });
  const data = await res.json();
  return data?.data?.validateCoupon as {
    ok: boolean;
    message: string;
    code: string | null;
    discount: number;
  } | null;
}

export function CouponProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [coupon, setCoupon] = useState<AppliedCoupon>(null);
  const [hydrated, setHydrated] = useState(false);
  const couponRef = useRef<AppliedCoupon>(null);

  useEffect(() => {
    couponRef.current = coupon;
  }, [coupon]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setCoupon(JSON.parse(s));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (coupon) localStorage.setItem(STORAGE_KEY, JSON.stringify(coupon));
    else localStorage.removeItem(STORAGE_KEY);
  }, [coupon, hydrated]);

  const apply = useCallback(
    async (code: string, subtotal: number) => {
      const r = await validateOnServer(code, subtotal);
      if (r?.ok && r.code) {
        setCoupon({ code: r.code, discount: r.discount });
        toast("Coupon applied", "success");
        return { ok: true, message: r.message };
      }
      toast(r?.message ?? "Invalid coupon", "error");
      return { ok: false, message: r?.message ?? "Invalid coupon" };
    },
    [toast],
  );

  const refresh = useCallback(async (subtotal: number) => {
    const current = couponRef.current;
    if (!current) return;
    const r = await validateOnServer(current.code, subtotal);
    if (r?.ok && r.code) setCoupon({ code: r.code, discount: r.discount });
    else setCoupon(null); // coupon no longer valid for this subtotal
  }, []);

  const clear = useCallback(() => setCoupon(null), []);

  return (
    <CouponContext.Provider value={{ coupon, apply, refresh, clear }}>
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon() {
  const ctx = useContext(CouponContext);
  if (!ctx) throw new Error("useCoupon must be used inside CouponProvider");
  return ctx;
}
