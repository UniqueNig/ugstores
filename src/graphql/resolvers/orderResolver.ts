import { connectDB } from "@/src/lib/db";
import orderModel from "@/src/models/Order";
import productModel from "@/src/models/Product";
import {
  recomputeOrderPricing,
  finalizePaidOrder,
  formatOrder,
  sendOrderStatusEmail,
} from "@/src/lib/orders";

type StockLine = { product: string; name?: string; quantity: number };

/**
 * Strict stock reservation for the UNPAID "place order" flow. Decrements each
 * product atomically only if enough is in stock; rolls back + throws on
 * shortage so we never oversell.
 */
async function reserveStockStrict(items: StockLine[]) {
  const reserved: StockLine[] = [];
  for (const item of items) {
    const updated = await productModel.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
    );
    if (!updated) {
      for (const r of reserved) {
        await productModel.updateOne({ _id: r.product }, { $inc: { stock: r.quantity } });
      }
      throw new Error(
        `Not enough stock for "${item.name ?? "an item"}". Please reduce the quantity or try again later.`,
      );
    }
    reserved.push(item);
  }
}

export const orderResolvers = {
  Query: {
    orders: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      if (!context.user || !["admin", "superadmin"].includes(context.user.role))
        throw new Error("Unauthorized");
      const orders = await orderModel.find().sort({ createdAt: -1 });
      return orders.map(formatOrder);
    },

    order: async (_: unknown, { id }: { id: string }, context: any) => {
      await connectDB();
      if (!context.user || !["admin", "superadmin"].includes(context.user.role))
        throw new Error("Unauthorized");
      const order = await orderModel.findById(id);
      if (!order) throw new Error("Order not found");
      return formatOrder(order);
    },

    myOrders: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const orders = await orderModel
        .find({ user: context.user.id })
        .sort({ createdAt: -1 });
      return orders.map(formatOrder);
    },

    // A single order belonging to the logged-in user (for the order detail page).
    myOrder: async (_: unknown, { id }: { id: string }, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const order = await orderModel.findById(id);
      if (!order) throw new Error("Order not found");
      const isAdmin = ["admin", "superadmin"].includes(context.user.role);
      if (!isAdmin && order.user?.toString() !== context.user.id)
        throw new Error("Unauthorized");
      return formatOrder(order);
    },
  },

  Mutation: {
    createOrder: async (
      _: unknown,
      { items, shippingAddress, shippingCost, paymentReference, couponCode }: any,
      context: any,
    ) => {
      await connectDB();

      // SECURITY: rebuild prices/totals from the DB — ignore client values.
      const pricing = await recomputeOrderPricing(items, shippingCost, couponCode);

      // Reserve stock up front (unpaid flow).
      await reserveStockStrict(pricing.lines);

      const order = await orderModel.create({
        user: context.user?.id ?? null,
        items: pricing.lines,
        shippingAddress,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        couponCode: pricing.couponCode,
        shippingCost: pricing.shippingCost,
        totalAmount: pricing.totalAmount,
        paymentMethod: "Paystack",
        paymentReference: paymentReference ?? null,
        isPaid: false,
        paidAt: null,
        status: "Pending",
      });

      return formatOrder(order);
    },

    // Called by the order-success page after Paystack redirect. Verifies the
    // transaction with Paystack, then finalizes via the shared (idempotent,
    // race-safe) finalizePaidOrder — the same path the webhook uses.
    verifyPaymentAndCreateOrder: async (
      _: unknown,
      { reference, items, shippingAddress, shippingCost, couponCode }: any,
      context: any,
    ) => {
      await connectDB();

      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) throw new Error("Paystack secret not configured");

      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${secret}` } },
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.status || verifyData.data?.status !== "success") {
        throw new Error("Payment not verified");
      }

      const { order } = await finalizePaidOrder({
        reference,
        paidAmountKobo: verifyData.data.amount,
        shippingAddress,
        items,
        shippingCost,
        couponCode,
        contextUserId: context.user?.id ?? null,
      });

      return formatOrder(order);
    },

    updateOrderStatus: async (
      _: unknown,
      { id, status }: { id: string; status: string },
      context: any,
    ) => {
      await connectDB();
      if (!context.user || !["admin", "superadmin"].includes(context.user.role))
        throw new Error("Unauthorized");
      const order = await orderModel.findById(id);
      if (!order) throw new Error("Order not found");

      const prevStatus = order.status;

      // Return stock when cancelled/failed — only on the first such transition.
      const releaseStates = ["Cancelled", "Failed"];
      const wasReleased = releaseStates.includes(order.status);
      const willRelease = releaseStates.includes(status);
      if (willRelease && !wasReleased) {
        for (const item of order.items) {
          await productModel.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
          );
        }
      }

      order.status = status;
      if (status === "Delivered") order.deliveredAt = new Date();
      await order.save();

      // Email the customer about the new status (only on a real change). The
      // dashboard notification bell already reflects it via the bumped
      // updatedAt. Awaited + isolated so a mail hiccup can't fail the update.
      if (status !== prevStatus) {
        try {
          await sendOrderStatusEmail(order, status);
        } catch (e) {
          console.error("Order status email failed:", e);
        }
      }

      return formatOrder(order);
    },
  },
};
