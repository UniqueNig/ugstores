# FanMidCommerce — Deploy Checklist

A repeatable checklist for deploying this store (and future client copies) to Vercel.

## 1. Environment variables (set ALL of these in Vercel → Project → Settings → Environment Variables)

| Variable | Example / Notes |
|---|---|
| `MONGO_DB_URI` | Your MongoDB Atlas connection string (use a **separate DB per client**). |
| `JWT_SECRET` | A long random string. **Change it from the dev value** before going live. |
| `NEXT_PUBLIC_SITE_URL` | Your real URL, e.g. `https://yourshop.com`. Used by SEO, sitemap, canonical, OG, emails. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (for image uploads). |
| `PAYSTACK_SECRET_KEY` | **LIVE** secret key (`sk_live_...`) — see §2. |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | **LIVE** public key (`pk_live_...`). |
| `RESEND_API_KEY` | Your Resend API key. |
| `RESEND_FROM` | `Your Shop <noreply@yourdomain.com>` — needs a verified domain (see §3). |
| `EMAIL_OVERRIDE` | **Leave UNSET in production** so mail reaches real customers. Only set in sandbox/testing. |
| `CONTACT_EMAIL` | (Optional) where /contact messages go, e.g. `support@yourdomain.com`. |
| `UPSTASH_REDIS_REST_URL` | **(Optional)** Shared rate limiter. Without it, an in-memory fallback is used — nothing breaks. See §8. |
| `UPSTASH_REDIS_REST_TOKEN` | **(Optional)** Pairs with the URL above. See §8. |

> Tip: set the same vars locally in `.env.local` for testing. `NEXT_PUBLIC_*` vars are exposed to the browser — never put secrets in them.

## 2. Paystack (go live)
- Switch from **test** keys (`sk_test_/pk_test_`) to **live** keys (`sk_live_/pk_live_`) in Vercel env vars.
- Complete Paystack business verification (required for live mode).
- ✅ **Add the Paystack webhook** (built): in the Paystack dashboard → Settings → API Keys & Webhooks, set the webhook URL to `https://yourshop.com/api/paystack/webhook`. This finalizes orders server-side even if the customer closes the tab after paying (signature-verified, idempotent).

## 3. Email / Resend (real delivery)
1. Add your domain in the Resend dashboard and add the DNS records it gives you.
2. Once verified, set `RESEND_FROM` to an address on that domain.
3. Remove `EMAIL_OVERRIDE` so emails go to real recipients (not your inbox).

## 4. Cloudinary
- Ensure an **unsigned upload preset** named `fanmid_products` exists (Cloudinary → Settings → Upload → Upload presets). Admin product/team image uploads use it.

## 5. Database / seeding
- Shipping methods, team, and testimonials **auto-seed** on first page load (Standard ₦3,000 / Express ₦7,000 / Store Pickup free).
- Run the slug backfill once if importing existing products: `npm run backfill:slugs`.
- Create your real **categories** and **products** in the admin before launch.

## 6. Admin account
- There is no public admin signup (the sign-up form always creates a normal
  "user"), and the in-app "Add admin" needs an existing admin. So create the
  FIRST admin with the bundled script:

  ```bash
  npm run create:admin -- "Full Name" you@store.com "StrongPassword123"
  # add a 4th arg "admin" for a regular admin; default is superadmin
  ```

  It reads `MONGO_DB_URI` from `.env.local`, bcrypt-hashes the password, and
  creates (or promotes) that user to admin. Re-running with an existing email
  resets that account's password — handy if you forget it.
- After that, add any other admins from **/admin** (Admins page) — no script needed.
- Log in at `/admin/login`. Admin routes are protected by middleware + per-resolver role checks.

## 7. Final pre-launch smoke test
- [ ] Place a real test order end-to-end (add to cart → checkout → pay → order confirmed).
- [ ] Confirm stock decremented and the order shows in `/admin/orders`.
- [ ] Apply a coupon and confirm the discount reaches the charged amount.
- [ ] Submit the contact form and the newsletter form.
- [ ] Leave a product review as a verified buyer.
- [ ] Check `/sitemap.xml` and `/robots.txt` return your live domain.
- [ ] Verify `/admin` is blocked when logged out.
- [ ] Set a product's stock to 0, open its page, submit the "Notify me when back in stock" form; then restock it (set stock > 0 and save) and confirm the email arrives (see §9).

## 8. Rate limiting (optional — Upstash Redis)
The contact form, newsletter signup, and back-in-stock form are rate-limited to block bots/spam.
- **Default:** an in-memory limiter (per serverless instance). Works out of the box, no setup. Resets on cold start — fine for casual spam.
- **Stronger (shared across all instances):** set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
  1. Create a free database at <https://upstash.com> → open the **REST API** section.
  2. Copy the REST URL + REST token into those two env vars (Vercel **and** local `.env.local`).
  3. Redeploy. The app auto-detects them; if they're missing or unreachable it silently falls back to the in-memory limiter — nothing breaks.

## 9. Back-in-stock alerts (automatic)
- When a product (or a specific size) is sold out, customers see a "Notify me when back in stock" form on the product page.
- Their request is saved. When an **admin edits that product and stock goes from 0 → in stock** (overall, or for that size) and saves, everyone waiting is **emailed automatically**, then their alert is cleared.
- No extra setup — it just needs working email (Resend, §3).

## 10. Analytics (optional)
- `@vercel/analytics` is wired in. **Page views** work automatically once deployed.
- **Custom events** (add-to-cart, begin-checkout, purchase) require **Web Analytics enabled** on the Vercel project (Project → Analytics → Enable).
- View everything in Vercel → Project → **Analytics**.

## Done since first draft
- ✅ Paystack **webhook** (`/api/paystack/webhook`) — guaranteed, race-safe order finalization.
- ✅ **Order confirmation email** to the customer.
- ✅ **Forgot/reset password** flow (`/forgot-password`, `/reset-password`).
- ✅ **Spam protection** — honeypots + rate limiting (shared via Upstash when configured, §8).
- ✅ **Related products** on the product page; **enriched order detail** in the dashboard.
- ✅ **Analytics** (Vercel) — page views + add-to-cart/checkout/purchase events (§10).
- ✅ **Back-in-stock alerts** — auto-email waiters on restock (§9).
- ✅ **Server-side search + pagination** — shop & search filter/sort/page in the DB (scales to large catalogs).
- ✅ **Product variants** — colours (each with own images) + per-size stock + multi-image gallery.

## Remaining (optional, later)
- Google Analytics (in addition to Vercel), richer reporting.
- Internationalization / multi-currency.
