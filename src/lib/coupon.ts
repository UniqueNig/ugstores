import "server-only";
import { connectDB } from "@/src/lib/db";
import couponModel from "@/src/models/Coupon";

export type CouponEval = {
  ok: boolean;
  message: string;
  code: string | null;
  type: "percent" | "fixed" | null;
  value: number;
  discount: number; // ₦ amount to subtract from the subtotal
};

/**
 * Validate a coupon against a subtotal and compute the discount — on the
 * SERVER. Used by both the validateCoupon query (cart/checkout UI) and the
 * order pricing recompute (so the discount is enforced, not just displayed).
 */
export async function evaluateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponEval> {
  const fail = (message: string): CouponEval => ({
    ok: false,
    message,
    code: null,
    type: null,
    value: 0,
    discount: 0,
  });

  if (!rawCode || !rawCode.trim()) return fail("Enter a coupon code.");

  await connectDB();
  const code = rawCode.trim().toUpperCase();
  const coupon: any = await couponModel.findOne({ code });

  if (!coupon) return fail("Invalid coupon code.");
  if (!coupon.active) return fail("This coupon is no longer active.");
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now())
    return fail("This coupon has expired.");
  if (subtotal < (coupon.minSubtotal ?? 0))
    return fail(
      `Spend at least ₦${Number(coupon.minSubtotal).toLocaleString()} to use this coupon.`,
    );

  let discount =
    coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  // Never negative, never more than the subtotal, rounded to whole naira.
  discount = Math.min(Math.max(0, Math.round(discount)), subtotal);

  return {
    ok: true,
    message: "Coupon applied",
    code,
    type: coupon.type,
    value: coupon.value,
    discount,
  };
}
