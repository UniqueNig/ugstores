import { connectDB } from "@/src/lib/db";
import shippingMethodModel from "@/src/models/ShippingMethod";
import teamMemberModel from "@/src/models/TeamMember";
import testimonialModel from "@/src/models/Testimonial";
import subscriberModel from "@/src/models/Subscriber";
import {
  getShippingMethods,
  getTeamMembers,
  getTestimonials,
  mapShipping,
  mapTeam,
  mapTestimonial,
} from "@/src/lib/data/content";

function requireAdmin(context: any) {
  if (!context?.user || !["admin", "superadmin"].includes(context.user.role)) {
    throw new Error("Unauthorized");
  }
}

export const contentResolvers = {
  Query: {
    // ── Public (seeded, active only) ──
    shippingMethods: async () => getShippingMethods(),
    teamMembers: async () => getTeamMembers(),
    testimonials: async () => getTestimonials(),

    // ── Admin (everything) ──
    adminShippingMethods: async (_: unknown, __: unknown, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      // Trigger the same first-run seeding the storefront does, so the admin
      // sees the default methods even before any customer hits checkout.
      await getShippingMethods();
      const docs = await shippingMethodModel.find().sort({ sortOrder: 1, cost: 1 });
      return docs.map(mapShipping);
    },
    adminTestimonials: async (_: unknown, __: unknown, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const docs = await testimonialModel.find().sort({ sortOrder: 1, createdAt: 1 });
      return docs.map(mapTestimonial);
    },
    subscribers: async (_: unknown, __: unknown, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const docs = await subscriberModel.find().sort({ createdAt: -1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        email: d.email,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
      }));
    },
  },

  Mutation: {
    // ── Shipping methods ──
    createShippingMethod: async (_: unknown, args: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await shippingMethodModel.create(args);
      return mapShipping(doc);
    },
    updateShippingMethod: async (_: unknown, { id, ...rest }: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await shippingMethodModel.findByIdAndUpdate(id, rest, { new: true });
      if (!doc) throw new Error("Shipping method not found");
      return mapShipping(doc);
    },
    deleteShippingMethod: async (_: unknown, { id }: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await shippingMethodModel.findByIdAndDelete(id);
      if (!doc) throw new Error("Shipping method not found");
      return mapShipping(doc);
    },

    // ── Team members ──
    createTeamMember: async (_: unknown, args: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await teamMemberModel.create(args);
      return mapTeam(doc);
    },
    updateTeamMember: async (_: unknown, { id, ...rest }: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await teamMemberModel.findByIdAndUpdate(id, rest, { new: true });
      if (!doc) throw new Error("Team member not found");
      return mapTeam(doc);
    },
    deleteTeamMember: async (_: unknown, { id }: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await teamMemberModel.findByIdAndDelete(id);
      if (!doc) throw new Error("Team member not found");
      return mapTeam(doc);
    },

    // ── Testimonials ──
    createTestimonial: async (_: unknown, args: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await testimonialModel.create(args);
      return mapTestimonial(doc);
    },
    updateTestimonial: async (_: unknown, { id, ...rest }: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await testimonialModel.findByIdAndUpdate(id, rest, { new: true });
      if (!doc) throw new Error("Testimonial not found");
      return mapTestimonial(doc);
    },
    deleteTestimonial: async (_: unknown, { id }: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await testimonialModel.findByIdAndDelete(id);
      if (!doc) throw new Error("Testimonial not found");
      return mapTestimonial(doc);
    },

    // ── Subscribers ──
    deleteSubscriber: async (_: unknown, { id }: any, ctx: any) => {
      await connectDB();
      requireAdmin(ctx);
      const doc = await subscriberModel.findByIdAndDelete(id);
      if (!doc) throw new Error("Subscriber not found");
      return { id: doc._id.toString(), email: doc.email, createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null };
    },
  },
};
