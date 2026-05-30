import { connectDB } from "@/src/lib/db";
import settingsModel from "@/src/models/Settings";

function formatSettings(s: any) {
  return { ...s._doc, id: s._id.toString() };
}

export const settingsResolvers = {
  Query: {
    settings: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      if (!context.user || !["admin", "superadmin"].includes(context.user.role)) throw new Error("Unauthorized");
      let settings = await settingsModel.findOne();
      if (!settings) settings = await settingsModel.create({});
      return formatSettings(settings);
    },
  },

  Mutation: {
    updateSettings: async (_: unknown, args: any, context: any) => {
      await connectDB();
      if (!context.user || !["admin", "superadmin"].includes(context.user.role)) throw new Error("Unauthorized");
      let settings = await settingsModel.findOne();
      if (!settings) settings = await settingsModel.create({});
      Object.assign(settings, args);
      await settings.save();
      return formatSettings(settings);
    },
  },
};