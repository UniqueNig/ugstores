# New Client Setup — Runbook

How to spin up a new client store from this boilerplate. Follow top to bottom.
You don't rebuild auth, products, cart, checkout, orders, payments, or the
dashboard — you only **configure** and **customize**.

> Tip: most of the "what to enter" comes from the client's answers in
> `docs/client-intake.html` (the questionnaire you send them). Get that back
> first — it fills in almost everything below.
>
> **Using Claude Code for the next client?** These docs travel with the
> duplicated repo — tell Claude Code to read `docs/NEW-CLIENT-SETUP.md` and
> `Guide.md` first. Claude's saved "memory" does NOT carry over to a new project
> folder, so these committed docs are your real handoff.

---

## 0. Reuse the engine, REBUILD the UI

This is the most important idea. The boilerplate's value is the **commerce
engine**, not the look. Every client should look different (that's a goal in
`Guide.md`), so you **keep the engine and redesign the storefront UI**.

**KEEP / reuse as-is (the engine — rarely touch):**

- `src/models/*` — database schemas (products, orders, users, coupons, reviews…)
- `src/graphql/*` and `src/features/*/graphql` — the API
- `src/features/*/data.ts` — server-side data access
- `src/lib/*` — auth, db, coupons, stock, rate limiting, analytics…
- `src/services/*` — email (and future integrations)
- `src/context/*` — cart / wishlist / coupon / toast state
- `app/api/*` — API routes (including the Paystack webhook)
- `app/(admin)/*` — the admin dashboard
- `app/(auth)/*` and `app/(dashboard)/*` — login + customer account

**REDESIGN per client (the UI — expected to look different):**

- `app/(public)/*` — storefront pages (home, shop, product, cart, checkout)
- `src/sections/*` — homepage sections (hero, featured, …)
- `src/components/layout/*` — Navbar, Footer
- `src/components/shop/*` and `src/features/products/components/*` — shop grid,
  product page UI
- `src/components/ui/*` — ProductCard, buttons, skeletons
- `src/themes/*` + `app/globals.css` — colours, fonts, spacing

**Rule of thumb:** if it talks to the database or processes orders/payments,
**keep it**. If it decides how things *look*, you're free to **rebuild it**. A
brand-new UI still works because it calls the same GraphQL queries and uses the
same cart/context — the engine doesn't care what the storefront looks like.

> So for the next client you can build a completely fresh storefront (new hero,
> new cards, new layout) on top of the untouched engine. The 3 theme presets are
> just a quick-start option, not a limit.

### Where the words (copy) live

All visible text is **content in the UI layer** — safe to rewrite freely; it
never affects the engine. You can change every word and nothing breaks.

- Repeating brand words (name, tagline, contact, social) → `src/config/site.ts`
- Hero headline, "why shop with us", section copy → `src/sections/*`
- About story, FAQ answers, policy text → those page components in `app/(public)/*`
- Nav links, button labels → layout/UI components
- Product & category names/descriptions → the **database** (entered in `/admin`),
  so naturally different for every client

Only rule: change the **words**, not the surrounding **data calls**. e.g. in a
product card, rewrite anything visible but keep `product.price` — that line pulls
real data from the engine.

---

## 1. Duplicate the project

```bash
# Option A: new GitHub repo from this one
#   On GitHub, click "Use this template" (or fork), then clone it.
# Option B: copy locally
git clone <this-repo-url> client-name-store
cd client-name-store
npm install
```

Create a fresh local env file:

```bash
cp .env.local .env.local   # then edit values (see step 4)
```

---

## 2. Brand the store — `src/config/site.ts`

This single file rebrands the whole storefront. Edit these:

| Field | What to put |
|---|---|
| `name` | Short brand name (e.g. `"Lola's Kitchen"`) |
| `legalName` | Full name for footer/SEO (e.g. `"Lola's Kitchen Ltd"`) |
| `wordmark` | The two-tone logo text, e.g. `{ start: "LOLA'S", end: "KITCHEN" }` |
| `tagline` | One-line promise shown in the footer |
| `seo` | Default page title + description (for Google) |
| `contact` | email, phone, whatsapp, location |
| `social` | Instagram/Twitter/etc. (leave `""` to hide) |
| `paymentRefPrefix` | Short code for payment refs, e.g. `"LOLA"` |
| `theme` | `"fashion"`, `"luxury"`, or `"minimal"` (see step 3) |
| `homepageSections` | The homepage layout order (see step 3) |

> The admin can later change store name, WhatsApp, and contact email live from
> **/admin/settings** — the config values are just the defaults.

---

## 3. Pick the look — theme + homepage layout

**Theme (colors):** set `theme` in `src/config/site.ts` to one of:

- `"fashion"` — warm beige + gold (the FanMid default)
- `"luxury"` — cream/espresso + brass
- `"minimal"` — clean white/black + slate blue

Want a custom palette? Copy `src/themes/minimal.ts` to `src/themes/<client>.ts`,
edit the colors, register it in `src/themes/index.ts`, and set `theme: "<client>"`.

**Homepage layout:** reorder/trim `homepageSections`. Available section names:

```
"hero", "value-props", "featured", "categories", "testimonials", "newsletter"
```

Example — a shorter homepage:

```ts
homepageSections: ["hero", "featured", "newsletter"]
```

---

## 4. Environment variables

Set these locally in `.env.local` **and** in Vercel → Settings → Environment
Variables. Full descriptions are in `DEPLOY.md` §1 — short version:

- `MONGO_DB_URI` — a **new, separate** database for this client
- `JWT_SECRET` — a fresh long random string
- `NEXT_PUBLIC_SITE_URL` — the client's real URL
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — image uploads
- `PAYSTACK_SECRET_KEY` + `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — the client's keys
- `RESEND_API_KEY` + `RESEND_FROM` — email (verify their domain in Resend)
- `EMAIL_OVERRIDE` — only while testing; **remove for production**
- `CONTACT_EMAIL` — where contact-form messages go
- `UPSTASH_REDIS_REST_URL` / `_TOKEN` — optional, stronger rate limiting

**Each client = separate database, separate Paystack, separate domain.**

---

## 5. Cloudinary (image uploads)

In the client's (or your) Cloudinary account, create an **unsigned upload
preset** named `fanmid_products` (Settings → Upload → Upload presets). The admin
product/team image uploaders use it.

---

## 6. First data + admin account

1. Deploy to Vercel (shipping methods, team, and testimonials auto-seed on first
   load).
2. Create the first **admin** with the bundled script (the public sign-up only
   makes normal users):

   ```bash
   npm run create:admin -- "Full Name" you@store.com "StrongPassword123"
   ```

   It reads `MONGO_DB_URI` from `.env.local` and creates a superadmin you can log
   in with right away. (More details in `DEPLOY.md` §6.)
3. Log in at `/admin/login` and add the client's real **categories** and
   **products** (with photos, sizes/colours, stock).

---

## 7. Go live

- Switch Paystack to **live** keys; complete their Paystack business verification.
- Add the Paystack **webhook**: `https://theirdomain.com/api/paystack/webhook`.
- Verify their domain in **Resend**, set `RESEND_FROM`, remove `EMAIL_OVERRIDE`.
- Connect the client's **domain** in Vercel.
- Run the smoke test in `DEPLOY.md` §7 (real test order, coupon, contact form,
  back-in-stock, sitemap/robots, admin blocked when logged out).

---

## Quick checklist

- [ ] Repo duplicated, `npm install`, `.env.local` created
- [ ] `src/config/site.ts` branded (name, wordmark, contact, social, prefix)
- [ ] `theme` + `homepageSections` chosen
- [ ] All env vars set (local + Vercel) — separate DB/Paystack/domain
- [ ] Cloudinary `fanmid_products` preset exists
- [ ] Admin account created; categories + products added
- [ ] Paystack live + webhook; Resend domain verified
- [ ] Domain connected; smoke test passed
