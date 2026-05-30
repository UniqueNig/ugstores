import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { finalizePaidOrder } from "@/src/lib/orders";

/**
 * Paystack webhook — the reliable, server-side way to finalize a paid order.
 * Fires even if the customer closes the tab before the success page loads.
 *
 * Configure in Paystack dashboard → Settings → API Keys & Webhooks:
 *   Webhook URL: https://YOUR_DOMAIN/api/paystack/webhook
 *
 * Security: every payload is signed with HMAC-SHA512 using your secret key.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: false }, { status: 500 });

  // Must verify against the RAW body, not re-stringified JSON.
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Acknowledge anything we don't act on (Paystack only needs a 200).
  if (event?.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: event?.event ?? null });
  }

  const data = event.data ?? {};
  const meta = data.metadata ?? {};

  let items: any[] = [];
  try {
    items = JSON.parse(meta.cart_items ?? "[]");
  } catch {
    items = [];
  }

  if (!data.reference || items.length === 0) {
    return NextResponse.json({ ok: true, skipped: "missing reference or items" });
  }

  const shippingAddress = {
    name: meta.name ?? "",
    email: data.customer?.email ?? meta.email ?? "",
    phone: meta.phone ?? "",
    address: meta.address ?? "",
    city: meta.city ?? "",
    state: meta.state ?? "",
  };

  try {
    await finalizePaidOrder({
      reference: data.reference,
      paidAmountKobo: data.amount,
      shippingAddress,
      items: items.map((i: any) => ({ product: i.product, quantity: i.quantity, size: i.size, color: i.color ?? "" })),
      shippingCost: Number(meta.shippingCost ?? 0),
      couponCode: meta.couponCode ?? null,
      contextUserId: null,
    });
  } catch (err) {
    // Log but still 200 — a permanent error (e.g. amount mismatch) shouldn't
    // trigger endless Paystack retries; the success page is a backup path.
    console.error("Webhook finalize error:", err);
  }

  return NextResponse.json({ ok: true });
}
