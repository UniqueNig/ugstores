import { connectDB } from "@/src/lib/db";
import couponModel from "@/src/models/Coupon";
import { evaluateCoupon } from "@/src/lib/coupon";

function requireAdmin(context: any) {
  if (!context?.user || !["admin", "superadmin"].includes(context.user.role)) {
    throw new Error("Unauthorized");
  }
}

function formatCoupon(c: any) {
  return {
    id: c._id?.toString() ?? c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minSubtotal: c.minSubtotal ?? 0,
    active: c.active ?? true,
    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
  };
}

export const couponResolvers = {
  Query: {
    // 🔒 Admin: list all coupons
    coupons: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      requireAdmin(context);
      const coupons = await couponModel.find().sort({ createdAt: -1 });
      return coupons.map(formatCoupon);
    },

    // Public: validate a code against a subtotal (used by cart/checkout)
    validateCoupon: async (
      _: unknown,
      { code, subtotal }: { code: string; subtotal: number },
    ) => {
      return await evaluateCoupon(code, subtotal);
    },
  },

  Mutation: {
    createCoupon: async (_: unknown, args: any, context: any) => {
      await connectDB();
      requireAdmin(context);

      if (!["percent", "fixed"].includes(args.type))
        throw new Error("Invalid coupon type");

      const code = String(args.code).trim().toUpperCase();
      const existing = await couponModel.findOne({ code });
      if (existing) throw new Error("A coupon with this code already exists");

      const coupon = await couponModel.create({
        code,
        type: args.type,
        value: args.value,
        minSubtotal: args.minSubtotal ?? 0,
        active: args.active ?? true,
        expiresAt: args.expiresAt ? new Date(args.expiresAt) : null,
      });
      return formatCoupon(coupon);
    },

    updateCoupon: async (_: unknown, { id, ...rest }: any, context: any) => {
      await connectDB();
      requireAdmin(context);

      const updates: Record<string, unknown> = {};
      if (rest.code !== undefined)
        updates.code = String(rest.code).trim().toUpperCase();
      if (rest.type !== undefined) {
        if (!["percent", "fixed"].includes(rest.type))
          throw new Error("Invalid coupon type");
        updates.type = rest.type;
      }
      if (rest.value !== undefined) updates.value = rest.value;
      if (rest.minSubtotal !== undefined) updates.minSubtotal = rest.minSubtotal;
      if (rest.active !== undefined) updates.active = rest.active;
      if (rest.expiresAt !== undefined)
        updates.expiresAt = rest.expiresAt ? new Date(rest.expiresAt) : null;

      const coupon = await couponModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });
      if (!coupon) throw new Error("Coupon not found");
      return formatCoupon(coupon);
    },

    deleteCoupon: async (
      _: unknown,
      { id }: { id: string },
      context: any,
    ) => {
      await connectDB();
      requireAdmin(context);
      const deleted = await couponModel.findByIdAndDelete(id);
      if (!deleted) throw new Error("Coupon not found");
      return formatCoupon(deleted);
    },
  },
};
