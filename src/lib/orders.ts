import { connectDB } from "@/src/lib/db";
import orderModel from "@/src/models/Order";
import userModel from "@/src/models/User";
import productModel from "@/src/models/Product";
import shippingMethodModel from "@/src/models/ShippingMethod";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import settingsModel from "@/src/models/Settings";
import { evaluateCoupon } from "@/src/lib/coupon";
import { MAIL_FROM, mailTo } from "@/src/services/email";
import {
  renderOrderEmail,
  renderWelcomeEmail,
  renderAdminOrderAlert,
  renderOrderStatusEmail,
} from "@/src/lib/emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export type OrderItemInput = {
  product: string;
  name?: string;
  image?: string | null;
  price?: number;
  quantity: number;
  size?: string;
  color?: string;
};

export type ShippingAddress = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

// ── Stock helpers ──────────────────────────────────────────────────────────

/** Decrement stock after a confirmed payment (floored at 0 — never reject). */
export async function reduceStockAfterPayment(
  items: { product: string; quantity: number; size?: string }[],
) {
  for (const item of items) {
    const qty = Math.abs(item.quantity);
    if (item.size) {
      // Sized product: decrement that specific size AND the product total.
      // (arrayFilters only matches if the product actually has that size; for
      // a non-sized product it just no-ops the size path and decrements total.)
      await productModel.updateOne(
        { _id: item.product },
        { $inc: { "sizeStock.$[s].stock": -qty, stock: -qty } },
        { arrayFilters: [{ "s.size": item.size }] },
      );
    } else {
      await productModel.updateOne({ _id: item.product }, { $inc: { stock: -qty } });
    }
  }
  // Safety: never show negative stock (product total or any size).
  await productModel.updateMany({ stock: { $lt: 0 } }, { $set: { stock: 0 } });
  await productModel.updateMany(
    { "sizeStock.stock": { $lt: 0 } },
    { $set: { "sizeStock.$[s].stock": 0 } },
    { arrayFilters: [{ "s.stock": { $lt: 0 } }] },
  );
}

// ── Server-authoritative pricing ─────────────────────────────────────────────

/**
 * Rebuild order lines + totals from the DB. The client only says WHICH products
 * and HOW MANY — never the price. Coupon and shipping are re-validated too.
 */
export async function recomputeOrderPricing(
  items: OrderItemInput[],
  shippingCostFromClient: number,
  couponCode?: string | null,
) {
  await connectDB();
  const ids = items.map((i) => i.product);
  const products = await productModel
    .find({ _id: { $in: ids } })
    .select("name price image")
    .lean();
  const byId = new Map(products.map((p: any) => [p._id.toString(), p]));

  const lines = items.map((i) => {
    const p = byId.get(i.product);
    if (!p) throw new Error("One or more items are no longer available.");
    const quantity = Math.max(1, Math.floor(i.quantity));
    return {
      product: i.product,
      name: p.name,
      image: p.image ?? null,
      price: p.price,
      quantity,
      size: i.size ?? "",
      color: i.color ?? "",
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  let discount = 0;
  let appliedCode: string | null = null;
  if (couponCode) {
    const result = await evaluateCoupon(couponCode, subtotal);
    if (result.ok) {
      discount = result.discount;
      appliedCode = result.code;
    }
  }

  const methods = await shippingMethodModel.find({ active: true }).select("cost").lean();
  const allowedCosts = methods.map((m: any) => m.cost);
  let shippingCost: number;
  if (allowedCosts.includes(shippingCostFromClient)) shippingCost = shippingCostFromClient;
  else if (allowedCosts.length > 0) shippingCost = Math.min(...allowedCosts);
  else shippingCost = Math.max(0, shippingCostFromClient);

  const totalAmount = Math.max(0, subtotal - discount) + shippingCost;
  return { lines, subtotal, discount, couponCode: appliedCode, shippingCost, totalAmount };
}

export function formatOrder(order: any) {
  return {
    ...order._doc,
    id: order._id.toString(),
    user: order.user?.toString() ?? null,
    createdAt: order.createdAt?.toISOString?.() ?? null,
    updatedAt: order.updatedAt?.toISOString?.() ?? null,
    paidAt: order.paidAt?.toISOString?.() ?? null,
    deliveredAt: order.deliveredAt?.toISOString?.() ?? null,
  };
}

// ── Emails ───────────────────────────────────────────────────────────────────

// IMPORTANT: emails are AWAITED. On Vercel/serverless, un-awaited promises are
// dropped once the response is sent, so fire-and-forget sends never deliver.
async function sendWelcomeEmail(name: string, email: string, password: string) {
  try {
    const r = await resend.emails.send({
      from: MAIL_FROM,
      to: mailTo(email),
      subject: "Your account details",
      html: renderWelcomeEmail(name, email, password),
    });
    if (r.error) console.error("Welcome email rejected:", r.error);
    else console.log("Welcome email sent to", mailTo(email));
  } catch (err) {
    console.error("Welcome email error:", err);
  }
}

async function sendOrderConfirmation(order: any, email: string) {
  try {
    const r = await resend.emails.send({
      from: MAIL_FROM,
      to: mailTo(email),
      subject: `Order confirmed — ${order.paymentReference ?? order._id}`,
      html: renderOrderEmail(order),
    });
    if (r.error) console.error("Order email rejected:", r.error);
    else console.log("Order email sent to", mailTo(email));
  } catch (err) {
    console.error("Order email error:", err);
  }
}

// Email the customer when an admin changes their order's status
// (Processing → Shipped → Delivered, etc.). Awaited so it sends on serverless.
export async function sendOrderStatusEmail(order: any, status: string) {
  const email = order?.shippingAddress?.email;
  if (!email) return;
  try {
    const r = await resend.emails.send({
      from: MAIL_FROM,
      to: mailTo(email),
      subject: `Your order is now ${status}`,
      html: renderOrderStatusEmail(order, status),
    });
    if (r.error) console.error("Status email rejected:", r.error);
    else console.log("Status email sent to", mailTo(email));
  } catch (err) {
    console.error("Status email error:", err);
  }
}

// Notify the store admin of a new order — gated by the "New Order Alerts"
// setting (on by default). Sends to the store contact email (or EMAIL_OVERRIDE
// in sandbox).
async function notifyAdminOfOrder(order: any) {
  try {
    const settings: any = await settingsModel.findOne();
    if (settings && settings.orderNotifs === false) return; // alerts turned off
    const to = mailTo(settings?.contactEmail || process.env.CONTACT_EMAIL || "");
    if (!to) return;
    const r = await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject: `New order — ${order.paymentReference ?? order._id}`,
      html: renderAdminOrderAlert(order),
    });
    if (r.error) console.error("Admin alert rejected:", r.error);
  } catch (err) {
    console.error("Admin alert error:", err);
  }
}

// ── Guest user creation ──────────────────────────────────────────────────────

async function ensureUser(
  shippingAddress: ShippingAddress,
  contextUserId?: string | null,
): Promise<string | null> {
  if (contextUserId) return contextUserId;
  if (!shippingAddress?.email) return null;

  let user = await userModel.findOne({ email: shippingAddress.email });
  if (!user) {
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    user = await userModel.create({
      name: shippingAddress.name,
      email: shippingAddress.email,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      password: hashedPassword,
      role: "user",
    });
    await sendWelcomeEmail(shippingAddress.name, shippingAddress.email, randomPassword);
  }
  return user._id.toString();
}

/**
 * Save the order's shipping address to the customer's account (works for
 * auto-created guest accounts too). Deduped by address+city+state so repeat
 * orders to the same place don't pile up. First address becomes the default.
 */
async function saveAddressToUser(
  userId: string | null,
  addr: ShippingAddress,
) {
  if (!userId || !addr?.address) return;
  const user = await userModel.findById(userId);
  if (!user) return;

  const norm = (s?: string) => (s ?? "").trim().toLowerCase();
  const exists = (user.addresses ?? []).some(
    (a: any) =>
      norm(a.address) === norm(addr.address) &&
      norm(a.city) === norm(addr.city) &&
      norm(a.state) === norm(addr.state),
  );
  if (exists) return;

  const first = (user.addresses?.length ?? 0) === 0;
  user.addresses.push({
    label: "",
    name: addr.name,
    phone: addr.phone,
    address: addr.address,
    city: addr.city,
    state: addr.state,
    isDefault: first,
  });
  await user.save();
}

// ── The single source of truth for finalizing a PAID order ───────────────────

export type FinalizeInput = {
  reference: string;
  paidAmountKobo: number;
  shippingAddress: ShippingAddress;
  items: OrderItemInput[];
  shippingCost: number;
  couponCode?: string | null;
  contextUserId?: string | null;
};

/**
 * Idempotent + race-safe (unique index on paymentReference). Verifies the
 * actually-paid amount against the server-recomputed total, creates the order,
 * decrements stock, and emails a confirmation. Used by BOTH the GraphQL
 * verify mutation and the Paystack webhook.
 */
export async function finalizePaidOrder(
  input: FinalizeInput,
): Promise<{ order: any; created: boolean }> {
  await connectDB();

  const existing = await orderModel.findOne({ paymentReference: input.reference });
  if (existing) return { order: existing, created: false };

  const pricing = await recomputeOrderPricing(
    input.items,
    input.shippingCost,
    input.couponCode,
  );

  const expectedKobo = Math.round(pricing.totalAmount * 100);
  if (input.paidAmountKobo !== expectedKobo) {
    throw new Error(
      "Paid amount does not match the order total. Please contact support with your reference.",
    );
  }

  const userId = await ensureUser(input.shippingAddress, input.contextUserId);

  let order;
  try {
    order = await orderModel.create({
      user: userId,
      items: pricing.lines,
      shippingAddress: input.shippingAddress,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      couponCode: pricing.couponCode,
      shippingCost: pricing.shippingCost,
      totalAmount: pricing.totalAmount,
      paymentMethod: "Paystack",
      paymentReference: input.reference,
      isPaid: true,
      paidAt: new Date(),
      status: "Processing",
    });
  } catch (err: any) {
    // Race: the webhook and the success page both finalized at once. The
    // unique index on paymentReference rejected the 2nd insert — return the
    // order the other path created, and DON'T decrement stock again.
    if (err?.code === 11000) {
      const winner = await orderModel.findOne({ paymentReference: input.reference });
      if (winner) return { order: winner, created: false };
    }
    throw err;
  }

  // Post-payment side-effects. The order is already created & paid, so each
  // step is isolated — one failing must never break the others. The email is
  // AWAITED so it actually sends before the serverless function freezes.
  try {
    await reduceStockAfterPayment(pricing.lines);
  } catch (e) {
    console.error("Stock decrement failed:", e);
  }
  try {
    await saveAddressToUser(userId, input.shippingAddress);
  } catch (e) {
    console.error("Address save failed:", e);
  }
  await sendOrderConfirmation(order, input.shippingAddress.email);
  await notifyAdminOfOrder(order);

  return { order, created: true };
}
