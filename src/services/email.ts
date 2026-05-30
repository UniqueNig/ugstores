/**
 * Email configuration helpers.
 *
 * SANDBOX MODE (no verified domain yet):
 *   - Resend's shared sender `onboarding@resend.dev` can ONLY deliver to your
 *     own Resend account email. So set EMAIL_OVERRIDE to that address and every
 *     outgoing mail is redirected there (handy for testing the flow).
 *
 * PRODUCTION (after you verify a domain in Resend):
 *   - Set RESEND_FROM to an address on your domain, e.g. "Shop <hello@yourshop.com>".
 *   - REMOVE EMAIL_OVERRIDE so mail goes to the real customer address.
 *
 * No code changes needed when you get a domain — just env vars.
 */

import { siteConfig } from "@/src/config/site";

// The "from" address. Override per client/deployment via RESEND_FROM; otherwise
// falls back to the store's brand name + Resend's shared sandbox sender.
export const MAIL_FROM =
  process.env.RESEND_FROM || `${siteConfig.name} <onboarding@resend.dev>`;

/**
 * Where to actually send. If EMAIL_OVERRIDE is set (sandbox), everything goes
 * there; otherwise it goes to the intended recipient.
 */
export function mailTo(intended: string): string {
  return process.env.EMAIL_OVERRIDE || intended;
}
