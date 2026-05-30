import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    // ✅ ADD THIS — tracks whether admin has disabled the account
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Saved delivery addresses (managed from the dashboard, used at checkout)
    addresses: [
      {
        label: { type: String, default: "" }, // "Home", "Work"
        name: { type: String, required: true },
        phone: { type: String, default: "" },
        address: { type: String, required: true },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }, // gives us createdAt (used as "joined")
);

const userModel =
  mongoose.models["ugstores-users"] ||
  mongoose.model("ugstores-users", userSchema);

// delete mongoose.models["ugstores-users"];
// const userModel = mongoose.model("ugstores-users", userSchema);

export default userModel;