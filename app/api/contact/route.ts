import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { MAIL_FROM, mailTo } from "@/src/services/email";
import { rateLimitAsync, clientIp } from "@/src/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, website } = await req.json();

    // Honeypot: real users never fill this hidden field — bots do.
    if (website) return NextResponse.json({ ok: true });

    // Rate limit: max 5 messages/minute per IP.
    if (!(await rateLimitAsync(`contact:${clientIp(req)}`, 5, 60_000))) {
      return NextResponse.json(
        { error: "Too many messages. Please try again shortly." },
        { status: 429 },
      );
    }

    if (!name || !email || !message || !isEmail(email)) {
      return NextResponse.json(
        { error: "Please fill in your name, a valid email, and a message." },
        { status: 400 },
      );
    }

    // Where contact messages land. Defaults to the override (your inbox in
    // sandbox); set CONTACT_EMAIL to a dedicated support address in production.
    const to = process.env.CONTACT_EMAIL || mailTo(email);

    await resend.emails.send({
      from: MAIL_FROM,
      to,
      replyTo: email, // so you can reply straight to the customer
      subject: `New contact message: ${subject || "(no subject)"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
          <h2>New contact message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "—"}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;background:#f4f4f4;padding:12px;border-radius:6px;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact send failed:", err);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
