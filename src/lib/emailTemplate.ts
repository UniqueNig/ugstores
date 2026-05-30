/**
 * Branded, email-client-safe HTML templates (table layout + inline styles).
 * Mirrors the storefront: near-black background, gold accent, FANMID wordmark.
 * Web fonts don't load in email, so we fall back to Georgia (serif headings)
 * and Helvetica/Arial (body) to approximate Playfair Display / DM Sans.
 */

import { siteConfig } from "@/src/config/site";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "";
const ACCENT = "#c8a96e";
// Brand strings for emails (kept in sync with the storefront via site config).
const BRAND = siteConfig.name;            // e.g. "FanMid"
const BRAND_LEGAL = siteConfig.legalName; // e.g. "FanMidCommerce"
const WORDMARK_START = siteConfig.wordmark.start;
const WORDMARK_END = siteConfig.wordmark.end;
const naira = (n: number) => `₦${Number(n || 0).toLocaleString()}`;

/** Outer shell: logo header + card + footer. */
function shell(inner: string, preheader = ""): string {
  const year = new Date().getFullYear();
  const host = SITE.replace(/^https?:\/\//, "");
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td align="center" style="padding-bottom:22px;">
                <span style="font-size:26px;font-weight:800;letter-spacing:-1px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">${WORDMARK_START}<span style="color:${ACCENT};">${WORDMARK_END}</span></span>
              </td>
            </tr>
            <tr>
              <td style="background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:32px;">
                ${inner}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:22px;color:#666666;font-size:12px;line-height:1.6;">
                © ${year} ${BRAND_LEGAL}${host ? ` · <a href="${SITE}" style="color:#888888;text-decoration:none;">${host}</a>` : ""}<br/>
                Premium fashion, curated.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, href: string): string {
  if (!href) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;"><tr>
    <td style="background:${ACCENT};border-radius:4px;">
      <a href="${href}" style="display:inline-block;padding:13px 28px;color:#000000;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;font-family:Helvetica,Arial,sans-serif;">${label}</a>
    </td></tr></table>`;
}

const h2 = (t: string) =>
  `<h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:800;color:#ffffff;">${t}</h1>`;
const p = (t: string) =>
  `<p style="margin:0 0 14px;color:#b0b0b0;font-size:14px;line-height:1.6;">${t}</p>`;

// ── Order confirmation ───────────────────────────────────────────────────────

export function renderOrderEmail(order: any): string {
  const ref = order.paymentReference ?? order._id;
  // Matches what the admin sees in the Orders list (#XXXXXX) so it can be
  // quoted by the customer and found/filtered by an admin.
  const orderId = `#${String(order._id ?? "").slice(-6).toUpperCase()}`;

  const itemRows = (order.items ?? [])
    .map(
      (i: any) => `
      <tr>
        <td width="56" valign="top" style="padding:10px 0;">
          ${
            i.image
              ? `<img src="${i.image}" width="48" height="58" alt="" style="width:48px;height:58px;object-fit:cover;border-radius:4px;display:block;border:1px solid rgba(255,255,255,0.08);" />`
              : `<div style="width:48px;height:58px;border-radius:4px;background:#1c1c1c;"></div>`
          }
        </td>
        <td valign="middle" style="padding:10px 12px;color:#eaeaea;font-size:14px;line-height:1.4;">
          ${i.name}<br/>
          <span style="color:#888888;font-size:12px;">${[
            i.color && `Colour: ${i.color}`,
            i.size && `Size: ${i.size}`,
            `Qty ${i.quantity}`,
          ]
            .filter(Boolean)
            .join(" &nbsp;·&nbsp; ")}</span>
        </td>
        <td valign="middle" align="right" style="padding:10px 0;color:#eaeaea;font-size:14px;white-space:nowrap;">
          ${naira(i.price * i.quantity)}
        </td>
      </tr>`,
    )
    .join("");

  const totalsRow = (label: string, value: string, opts: { accent?: boolean; green?: boolean; bold?: boolean } = {}) => `
    <tr>
      <td colspan="2" style="padding:4px 0;color:${opts.green ? "#22c55e" : opts.bold ? "#ffffff" : "#9a9a9a"};font-size:${opts.bold ? "16px" : "13px"};font-weight:${opts.bold ? "700" : "400"};">${label}</td>
      <td align="right" style="padding:4px 0;color:${opts.accent ? ACCENT : opts.green ? "#22c55e" : opts.bold ? "#ffffff" : "#cccccc"};font-size:${opts.bold ? "16px" : "13px"};font-weight:${opts.bold ? "700" : "400"};white-space:nowrap;">${value}</td>
    </tr>`;

  const addr = order.shippingAddress;
  const inner = `
    ${h2("Thank you for your order!")}
    ${p("We've received your payment and we're getting your order ready. Here's your summary:")}
    <p style="margin:0 0 18px;color:#777777;font-size:12px;">
      Order ID: <strong style="color:${ACCENT};">${orderId}</strong><br/>
      Payment reference: <strong style="color:#999999;">${ref}</strong>
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.08);">
      ${itemRows}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;">
      ${totalsRow("Subtotal", naira(order.subtotal))}
      ${order.discount > 0 ? totalsRow(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `-${naira(order.discount)}`, { green: true }) : ""}
      ${totalsRow("Shipping", naira(order.shippingCost))}
      ${totalsRow("Total", naira(order.totalAmount), { bold: true, accent: true })}
    </table>

    ${
      addr
        ? `<div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 6px;color:#777777;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Delivering to</p>
            <p style="margin:0;color:#cccccc;font-size:13px;line-height:1.6;">
              ${addr.name}<br/>${addr.address}, ${addr.city}, ${addr.state}${addr.phone ? `<br/>${addr.phone}` : ""}
            </p>
          </div>`
        : ""
    }

    ${button("View Your Orders", SITE ? `${SITE}/dashboard/orders` : "")}
  `;
  return shell(inner, `Your ${BRAND} order ${ref} is confirmed`);
}

// ── Order status update ──────────────────────────────────────────────────────

// Friendly copy per status. Falls back to a generic line for anything else.
const STATUS_COPY: Record<string, { title: string; line: string }> = {
  Pending:    { title: "We've received your order", line: "Your order has been received and is awaiting processing." },
  Processing: { title: "Your order is being prepared", line: "Good news — we've started preparing your order." },
  Shipped:    { title: "Your order is on its way", line: "Your order has shipped and is heading to you." },
  Delivered:  { title: "Your order has been delivered", line: "Your order has been delivered. We hope you love it!" },
  Cancelled:  { title: "Your order was cancelled", line: "Your order has been cancelled. If this looks wrong, please reply or contact us." },
  Failed:     { title: "There was a problem with your order", line: "Something went wrong with your order. Please contact us and we'll help." },
};

export function renderOrderStatusEmail(order: any, status: string): string {
  const orderId = `#${String(order._id ?? "").slice(-6).toUpperCase()}`;
  const c = STATUS_COPY[status] ?? {
    title: `Order update: ${status}`,
    line: `Your order status is now "${status}".`,
  };
  const inner = `
    ${h2(c.title)}
    ${p(c.line)}
    ${p(`Order <strong style="color:#ffffff;">${orderId}</strong> &nbsp;·&nbsp; Total ${naira(order.totalAmount)} &nbsp;·&nbsp; Status: <strong style="color:${ACCENT};">${status}</strong>`)}
    ${button("View Your Orders", SITE ? `${SITE}/dashboard/orders` : "")}
  `;
  return shell(inner, `Your ${BRAND} order ${orderId} is now ${status}`);
}

// ── Welcome (auto-created account) ───────────────────────────────────────────

export function renderWelcomeEmail(name: string, email: string, password: string): string {
  const inner = `
    ${h2(`Welcome, ${name}`)}
    ${p("An account was created for you when you placed your order, so you can track orders and check out faster next time.")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:6px;">
      <tr><td style="padding:16px 18px;color:#cccccc;font-size:13px;line-height:1.8;">
        <strong style="color:#ffffff;">Email:</strong> ${email}<br/>
        <strong style="color:#ffffff;">Temporary password:</strong> <span style="color:${ACCENT};font-family:monospace;">${password}</span>
      </td></tr>
    </table>
    ${p("Please sign in and change your password after your first login.")}
    ${button("Log In", SITE ? `${SITE}/login` : "")}
  `;
  return shell(inner, `Your ${BRAND} account details`);
}

// ── Admin: new-order alert ───────────────────────────────────────────────────

export function renderAdminOrderAlert(order: any): string {
  const orderId = `#${String(order._id ?? "").slice(-6).toUpperCase()}`;
  const inner = `
    ${h2("New order received")}
    ${p("A new order has just been placed and paid.")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:6px;">
      <tr><td style="padding:16px 18px;color:#cccccc;font-size:13px;line-height:1.9;">
        <strong style="color:#ffffff;">Order ID:</strong> <span style="color:${ACCENT};">${orderId}</span><br/>
        <strong style="color:#ffffff;">Customer:</strong> ${order.shippingAddress?.name ?? "—"}<br/>
        <strong style="color:#ffffff;">Total:</strong> <span style="color:${ACCENT};">${naira(order.totalAmount)}</span>
      </td></tr>
    </table>
    ${button("Open Orders", SITE ? `${SITE}/admin/orders` : "")}
  `;
  return shell(inner, `New order ${orderId} — ${naira(order.totalAmount)}`);
}

// ── Newsletter welcome ───────────────────────────────────────────────────────

export function renderSubscribeEmail(): string {
  const inner = `
    ${h2("You're on the list 🎉")}
    ${p(`Thanks for subscribing to ${BRAND}. You'll be the first to hear about new drops, private sales, and styling tips — no spam, ever.`)}
    ${button("Shop New Arrivals", SITE ? `${SITE}/shop` : "")}
  `;
  return shell(inner, `Welcome to the ${BRAND} list`);
}

// ── Back in stock ────────────────────────────────────────────────────────────

export function renderBackInStockEmail(args: {
  productName: string;
  url: string;
  size?: string;
  color?: string;
  image?: string;
}): string {
  const variant = [
    args.color && `Colour: ${args.color}`,
    args.size && `Size: ${args.size}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const inner = `
    ${h2("It's back in stock")}
    ${
      args.image
        ? `<img src="${args.image}" width="120" alt="" style="width:120px;height:auto;border-radius:6px;display:block;margin:0 0 16px;border:1px solid rgba(255,255,255,0.08);" />`
        : ""
    }
    ${p(`<strong style="color:#ffffff;">${args.productName}</strong> is available again${variant ? ` <span style="color:#888888;">(${variant})</span>` : ""}. Popular items sell out fast — grab yours before it's gone.`)}
    ${button("Shop Now", args.url)}
  `;
  return shell(inner, `${args.productName} is back in stock`);
}

// ── Password reset ───────────────────────────────────────────────────────────

export function renderResetEmail(name: string, link: string): string {
  const inner = `
    ${h2(`Hi ${name || "there"}`)}
    ${p("We received a request to reset your password. This link expires in 1 hour.")}
    ${button("Reset Password", link)}
    ${p(`<span style="color:#777777;font-size:12px;">If you didn't request this, you can safely ignore this email.</span>`)}
  `;
  return shell(inner, `Reset your ${BRAND} password`);
}
