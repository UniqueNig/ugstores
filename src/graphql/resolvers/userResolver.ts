import bcrypt from "bcryptjs";
import { connectDB } from "@/src/lib/db";
import userModel from "@/src/models/User";
import orderModel from "@/src/models/Order"; // 👈 needed to compute orders + spent
import {
  generateToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from "@/src/lib/auth";
import { Resend } from "resend";
import { MAIL_FROM, mailTo } from "@/src/services/email";
import { renderResetEmail } from "@/src/lib/emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

// Awaited (see orders.ts note) so the email actually sends on serverless.
async function sendPasswordResetEmail(name: string, email: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const link = `${siteUrl}/reset-password?token=${token}`;
  try {
    const r = await resend.emails.send({
      from: MAIL_FROM,
      to: mailTo(email),
      subject: "Reset your password",
      html: renderResetEmail(name, link),
    });
    if (r.error) console.error("Reset email rejected:", r.error);
  } catch (err) {
    console.error("Reset email error:", err);
  }
}

// ── Helper: compute orders count + total spent for a user ─────────────────
async function getUserStats(userId: string) {
  try {
    // Find all orders belonging to this user
    const userOrders = await orderModel.find({ user: userId });
    const orders = userOrders.length;
    const spent = userOrders.reduce(
      (sum: number, o: any) => sum + (o.totalAmount ?? 0),
      0,
    );
    return { orders, spent };
  } catch {
    // If Order model doesn't exist yet, return 0s gracefully
    return { orders: 0, spent: 0 };
  }
}

// ── Helper: format a Mongoose user doc into GraphQL shape ─────────────────
function formatUser(user: any) {
  // `createdAt` is non-nullable in the schema. Some docs lack it — e.g. admins
  // created by the create-admin script, or legacy records — so fall back to the
  // timestamp embedded in the Mongo ObjectId (every _id carries its creation
  // time), and finally to "now". This guarantees we never return null.
  const created =
    user.createdAt ?? user._id?.getTimestamp?.() ?? new Date();
  return {
    ...user._doc,
    id: user._id.toString(),
    createdAt: new Date(created).toISOString(),
    status: user.status ?? "Active",
  };
}

function formatAddress(a: any) {
  return {
    id: a._id.toString(),
    label: a.label ?? "",
    name: a.name,
    phone: a.phone ?? "",
    address: a.address,
    city: a.city ?? "",
    state: a.state ?? "",
    isDefault: a.isDefault ?? false,
  };
}

export const userResolvers = {
  // ── Field resolvers: orders + spent are computed per user ───────────────
  User: {
    orders: async (parent: any) => {
      const { orders } = await getUserStats(parent.id);
      return orders;
    },
    spent: async (parent: any) => {
      const { spent } = await getUserStats(parent.id);
      return spent;
    },
  },

  Query: {
    users: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      // 🔒 Admins only — this exposes every customer's personal data.
      if (!context.user || !["admin", "superadmin"].includes(context.user.role))
        throw new Error("Unauthorized");
      try {
        const usersDB = await userModel.find().select("-password");
        return usersDB.map(formatUser);
      } catch {
        throw new Error("Failed to fetch users");
      }
    },

    user: async (_: unknown, { id }: { id: string }, context: any) => {
      await connectDB();
      // 🔒 Admins can read anyone; a normal user may only read themselves.
      if (!context.user) throw new Error("Not authenticated");
      const isAdmin = ["admin", "superadmin"].includes(context.user.role);
      if (!isAdmin && context.user.id !== id) throw new Error("Unauthorized");
      try {
        const userDB = await userModel.findById(id).select("-password");
        if (!userDB) throw new Error("User not found");
        return formatUser(userDB);
      } catch {
        throw new Error("Failed to fetch user");
      }
    },

    me: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const user = await userModel
        .findById(context.user.id)
        .select("-password");
      if (!user) throw new Error("User not found");
      return formatUser(user);
    },

    admins: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      if (!context.user || !["admin", "superadmin"].includes(context.user.role))
        throw new Error("Unauthorized");
      const adminUsers = await userModel
      .find({ role: { $in: ["admin", "superadmin"] } })
        .select("-password");
      return adminUsers.map(formatUser);
    },

    myAddresses: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const user = await userModel
        .findById(context.user.id)
        .select("addresses address name phone");
      // Backfill: users who registered before we seeded the saved-address list
      // have their address only in the loose `address` string. Migrate it into
      // the addresses array once so it appears here and at checkout.
      if (user && (user.addresses?.length ?? 0) === 0 && user.address) {
        user.addresses.push({
          label: "Home",
          name: user.name,
          phone: user.phone ?? "",
          address: user.address,
          city: "",
          state: "",
          isDefault: true,
        });
        await user.save();
      }
      return (user?.addresses ?? []).map(formatAddress);
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      {
        name,
        email,
        phone,
        address,
        password,
      }: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        password: string;
      },
    ) => {
      await connectDB();
      const existingUser = await userModel.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      // The address typed at registration also becomes the user's first SAVED
      // address (default), so it shows on the Addresses page and is selectable
      // at checkout — not just stored as a loose `address` string.
      const addresses = address
        ? [{ label: "Home", name, phone: phone ?? "", address, city: "", state: "", isDefault: true }]
        : [];
      const newUser = await userModel.create({
        name,
        email,
        phone,
        address,
        password: hashedPassword,
        role: "user",
        status: "Active",
        addresses,
      });

      return formatUser(newUser);
    },

    login: async (
      _: unknown,
      { email, password }: { email: string; password: string },
    ) => {
      await connectDB();
      const user = await userModel.findOne({ email });
      if (!user) throw new Error("Invalid credentials");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

     const token = generateToken({ _id: user._id.toString(), role: user.role });
      return { token, user: formatUser(user) };
    },

    updateUser: async (
      _: unknown,
      {
        id,
        name,
        email,
        phone,
        address,
      }: {
        id: string;
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
      },
      context: any,
    ) => {
      await connectDB();
      // 🔒 Admin-only. Users update themselves via updateProfile.
      if (!context.user || !["admin", "superadmin"].includes(context.user.role))
        throw new Error("Unauthorized");
      const user = await userModel.findById(id);
      if (!user) throw new Error("User not found");

      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;

      await user.save();
      return formatUser(user);
    },

    updateProfile: async (
      _: unknown,
      {
        name,
        email,
        phone,
        address,
      }: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
      },
      context: any,
    ) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");

      const user = await userModel.findById(context.user.id);
      if (!user) throw new Error("User not found");

      user.name = name;
      user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;

      await user.save();
      return formatUser(user);
    },

    // ✅ Admin can toggle a user Active/Inactive
    updateUserStatus: async (
      _: unknown,
      { id, status }: { id: string; status: string },
      context: any,
    ) => {
      await connectDB();
      if (!context.user || !["admin", "superadmin"].includes(context.user.role)) {
        throw new Error("Unauthorized");
      }

      const user = await userModel.findById(id);
      if (!user) throw new Error("User not found");

(user as any).status = status;
      await user.save();
      return formatUser(user);
    },

    // Always returns true (don't reveal whether an email exists). Sends a
    // reset link only if the account is found.
    requestPasswordReset: async (_: unknown, { email }: { email: string }) => {
      await connectDB();
      const user = await userModel.findOne({ email });
      if (user) {
        const token = generatePasswordResetToken(user._id.toString());
        await sendPasswordResetEmail(user.name, user.email, token);
      }
      return true;
    },

    resetPassword: async (
      _: unknown,
      { token, newPassword }: { token: string; newPassword: string },
    ) => {
      await connectDB();
      const userId = verifyPasswordResetToken(token);
      if (!userId) throw new Error("This reset link is invalid or has expired.");
      if (!newPassword || newPassword.length < 8)
        throw new Error("Password must be at least 8 characters.");

      const user = await userModel.findById(userId);
      if (!user) throw new Error("Account not found.");

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return true;
    },

    // ── Saved addresses (all operate on the logged-in user) ──────────────
    addAddress: async (_: unknown, { input }: any, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const user = await userModel.findById(context.user.id);
      if (!user) throw new Error("User not found");
      const first = (user.addresses?.length ?? 0) === 0;
      user.addresses.push({ ...input, isDefault: first }); // first one becomes default
      await user.save();
      return user.addresses.map(formatAddress);
    },

    updateAddress: async (_: unknown, { id, input }: any, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const user = await userModel.findById(context.user.id);
      if (!user) throw new Error("User not found");
      const addr = user.addresses.id(id);
      if (!addr) throw new Error("Address not found");
      Object.assign(addr, input);
      await user.save();
      return user.addresses.map(formatAddress);
    },

    deleteAddress: async (_: unknown, { id }: any, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const user = await userModel.findById(context.user.id);
      if (!user) throw new Error("User not found");
      const wasDefault = user.addresses.id(id)?.isDefault;
      user.addresses.pull({ _id: id });
      // If we removed the default and others remain, promote the first.
      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }
      await user.save();
      return user.addresses.map(formatAddress);
    },

    setDefaultAddress: async (_: unknown, { id }: any, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const user = await userModel.findById(context.user.id);
      if (!user) throw new Error("User not found");
      user.addresses.forEach((a: any) => {
        a.isDefault = a._id.toString() === id;
      });
      await user.save();
      return user.addresses.map(formatAddress);
    },

    changePassword: async (
      _: unknown,
      {
        currentPassword,
        newPassword,
      }: { currentPassword: string; newPassword: string },
      context: any,
    ) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");

      const user = await userModel.findById(context.user.id);
      if (!user) throw new Error("User not found");

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) throw new Error("Current password is incorrect");

      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) throw new Error("New password must be different");

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return true;
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: any) => {
      await connectDB();
      // 🔒 Admin-only. Users delete their own account via deleteAccount.
      if (!context.user || !["admin", "superadmin"].includes(context.user.role))
        throw new Error("Unauthorized");
      const deletedUser = await userModel.findByIdAndDelete(id);
      if (!deletedUser) throw new Error("User not found");
      return formatUser(deletedUser);
    },

    deleteAccount: async (_: unknown, __: unknown, context: any) => {
      await connectDB();
      if (!context.user) throw new Error("Not authenticated");
      const deletedUser = await userModel.findByIdAndDelete(context.user.id);
      if (!deletedUser) throw new Error("User not found");
      return true;
    },

    createAdmin: async (
      _: unknown,
      {
        name,
        email,
        password,
        role,
      }: { name: string; email: string; password: string; role?: string },
      context: any,
    ) => {
      await connectDB();
if (!context.user || !["admin", "superadmin"].includes(context.user.role))
  throw new Error("Unauthorized");

      const existing = await userModel.findOne({ email });
      if (existing) throw new Error("User with this email already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role: role === "superadmin" ? "superadmin" : "admin", // ← use passed role
        status: "Active",
      });

      return formatUser(newUser);
    },
  },
};
