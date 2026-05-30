import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { connectDB } from "@/src/lib/db";
import subscriberModel from "@/src/models/Subscriber";
import { rateLimitAsync, clientIp } from "@/src/lib/rateLimit";
import { MAIL_FROM, mailTo } from "@/src/services/email";
import { renderSubscribeEmail } from "@/src/lib/emailTemplate";
import { siteConfig } from "@/src/config/site";

const resend = new Resend(process.env.RESEND_API_KEY);

// Basic email shape check.
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: NextRequest) {
  try {
    const { email, website } = await req.json();

    // Honeypot — silently accept bot submissions without storing them.
    if (website) return NextResponse.json({ ok: true });

    if (!(await rateLimitAsync(`subscribe:${clientIp(req)}`, 5, 60_000))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    if (!email || !isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    await connectDB();

    // Upsert so re-subscribing is idempotent (no duplicate-key error).
    const clean = email.toLowerCase().trim();
    const result = await subscriberModel.updateOne(
      { email: clean },
      { $setOnInsert: { email: clean } },
      { upsert: true },
    );

    // Send a welcome email only on a NEW subscription (don't spam re-subscribers).
    if (result.upsertedCount > 0) {
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: mailTo(clean),
          subject: `Welcome to ${siteConfig.name}`,
          html: renderSubscribeEmail(),
        });
      } catch (e) {
        console.error("Subscribe email error:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe failed:", err);
    return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
  }
}
