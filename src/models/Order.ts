import mongoose from "mongoose";

// Each item inside an order (a product + qty + price at time of purchase)
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ugstores-products",
    required: true,
  },
  name:     { type: String, required: true },  // snapshot of product name
  image:    { type: String },                  // snapshot of product image
  price:    { type: Number, required: true },  // price AT TIME of purchase
  quantity: { type: Number, required: true, default: 1 },
  size:     { type: String, default: "" },     // chosen size (for per-size stock)
  color:    { type: String, default: "" },     // chosen colour (snapshot)
});

const orderSchema = new mongoose.Schema(
  {
    // Who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ugstores-users",
      required: false, // allow null for guest checkout
    },

    // What they ordered
    items: [orderItemSchema],

    // Shipping details
shippingAddress: {
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
},

    // Payment
    paymentMethod:    { type: String, default: "Paystack" },
    // unique+sparse → guarantees one order per payment ref (race-safe between
    // the success page and the Paystack webhook); null refs (unpaid) allowed.
    paymentReference: { type: String, unique: true, sparse: true },
    isPaid:           { type: Boolean, default: false },
    paidAt:           { type: Date },

    // Pricing
    subtotal:      { type: Number, required: true }, // before shipping & discount
    discount:      { type: Number, default: 0 },     // coupon discount applied
    couponCode:    { type: String, default: null },  // code used, if any
    shippingCost:  { type: Number, default: 0 },
    totalAmount:   { type: Number, required: true }, // subtotal - discount + shipping

    // Order lifecycle status
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Failed", "Cancelled"],
      default: "Pending",
    },

    // Delivery tracking
    deliveredAt: { type: Date },
  },
  { timestamps: true }, // gives createdAt + updatedAt automatically
);

const orderModel =
  mongoose.models["ugstores-orders"] ||
  mongoose.model("ugstores-orders", orderSchema);

export default orderModel;