import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { MAIL_FROM, mailTo } from "@/src/services/email";
import { siteConfig } from "@/src/config/site";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  await resend.emails.send({
    from: MAIL_FROM,
    to: mailTo(email), // real customer in prod; EMAIL_OVERRIDE in sandbox
    subject: `Your ${siteConfig.name} account details`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Hi ${name},</h2>
        <p>An account was automatically created for you when you placed your order.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> <code>${password}</code></p>
        <p>Please log in and change your password after your first login.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login"
          style="display:inline-block;margin-top:16px;padding:12px 24px;background:#000;color:#fff;text-decoration:none;font-weight:bold;">
          Log In Now
        </a>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}