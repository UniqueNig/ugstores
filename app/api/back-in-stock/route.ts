import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/src/lib/db";
import productModel from "@/src/models/Product";
import stockAlertModel from "@/src/models/StockAlert";
import { rateLimitAsync, clientIp } from "@/src/lib/rateLimit";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Register a "notify me when back in stock" request for a (sold-out) product,
 * optionally for a specific size/colour. Rate-limited + honeypot-protected.
 * The actual email is sent later, from the product-update resolver, when stock
 * for that variant returns.
 */
export async function POST(req: NextRequest) {
  try {
    const { productId, email, size, color, website } = await req.json();

    // Honeypot — silently accept bot submissions.
    if (website) return NextResponse.json({ ok: true });

    if (!(await rateLimitAsync(`bis:${clientIp(req)}`, 5, 60_000))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }
    if (!email || !isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    await connectDB();

    const product = await productModel.findById(productId).select("_id").lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const clean = email.toLowerCase().trim();
    // Upsert so repeat requests for the same variant don't error or duplicate.
    await stockAlertModel.updateOne(
      { product: productId, email: clean, size: size || "", color: color || "" },
      { $setOnInsert: { product: productId, email: clean, size: size || "", color: color || "" } },
      { upsert: true },
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Back-in-stock subscribe failed:", err);
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  }
}
