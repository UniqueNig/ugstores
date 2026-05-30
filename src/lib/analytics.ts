import { track } from "@vercel/analytics";

/**
 * Thin, centralized wrapper over Vercel Analytics custom events.
 *
 * - Page views are captured automatically by <Analytics /> in the root layout.
 * - These custom events (add-to-cart, checkout, purchase) need Web Analytics
 *   enabled on the Vercel project. They no-op safely in local dev and when
 *   analytics isn't enabled, so calling them is always safe.
 * - Event property values must be string | number | boolean | null, so we keep
 *   the payloads flat and simple (no nested objects / arrays).
 */

export function trackAddToCart(args: {
  id: string;
  name: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}) {
  try {
    track("add_to_cart", {
      id: args.id,
      name: args.name,
      price: args.price,
      size: args.size || "",
      color: args.color || "",
      quantity: args.quantity,
    });
  } catch {
    /* analytics must never break the app */
  }
}

export function trackBeginCheckout(args: { value: number; items: number }) {
  try {
    track("begin_checkout", { value: args.value, items: args.items });
  } catch {
    /* ignore */
  }
}

export function trackPurchase(args: {
  reference: string;
  value: number;
  items: number;
}) {
  try {
    track("purchase", {
      reference: args.reference,
      value: args.value,
      items: args.items,
    });
  } catch {
    /* ignore */
  }
}
