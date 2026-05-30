# Client Questionnaire — Google Form (auto-build script)

This creates the whole questionnaire as a **Google Form** in your Drive in one
click — no manual question-adding. You'll get a shareable link to send clients
(they fill it on their phone; answers collect automatically in the form +
optional Google Sheet).

## How to use (about 3 minutes)

1. Go to **https://script.google.com** and sign in with your Google account.
2. Click **New project**.
3. Delete the sample code, then **paste the entire script below**.
4. Click **Save** (💾), then click **Run** (▶).
5. The first time, Google asks for permission — click **Review permissions** →
   choose your account → **Allow**. (It only needs permission to create the form
   in your own Drive.)
6. Click **Run** again if needed. When it finishes, open **View → Logs** (or
   **Execution log**) — it prints two links:
   - **Edit link** — to tweak the form
   - **Share link** — the one you send to clients ✅

That's it. To collect answers in a spreadsheet: open the form → **Responses** tab
→ the green Sheets icon.

---

## The script

```javascript
function createClientQuestionnaire() {
  const form = FormApp.create("Let's Build Your Online Store");
  form.setDescription(
    "A few questions so we can design a shop that fits your brand and sells your " +
    "products. Answer what you can — if you're unsure about anything, leave it " +
    "blank and we'll figure it out together. Don't worry about technical words; " +
    "just describe things in your own words."
  );
  form.setCollectEmail(true);       // capture the respondent's email
  form.setProgressBar(true);

  // ── 1. About your business ───────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("1 · About Your Business")
    .setHelpText("The basics that appear across your site.");
  form.addTextItem().setTitle("Business name (exactly as it should appear)").setRequired(true);
  form.addTextItem().setTitle("One short sentence describing what you sell (your tagline)");
  form.addParagraphTextItem().setTitle("Tell your story in a few lines")
    .setHelpText("How/why you started — used on the About page.");
  form.addTextItem().setTitle("City / Location");
  form.addTextItem().setTitle("Year started (optional)");

  // ── 2. Contact ─────────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("2 · How Customers Reach You");
  form.addTextItem().setTitle("Business email");
  form.addTextItem().setTitle("Phone number");
  form.addTextItem().setTitle("WhatsApp number for orders (with country code, e.g. 234...)");
  form.addParagraphTextItem().setTitle("Social media links (Instagram, Facebook, TikTok, X)");

  // ── 3. Products ──────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("3 · Your Products");
  form.addParagraphTextItem().setTitle("What kinds of products do you sell?")
    .setHelpText("List your main categories, e.g. Dresses, Bags, Shoes.");
  form.addTextItem().setTitle("Roughly how many products to start with?");
  form.addTextItem().setTitle("Typical price range");
  form.addCheckboxItem().setTitle("Do your products come in variations?")
    .setChoiceValues(["Sizes (S, M, L… or shoe numbers)", "Colours", "Neither — single version"]);
  form.addMultipleChoiceItem().setTitle("Should the site track stock and show \"Sold Out\"?")
    .setChoiceValues(["Yes, track stock", "No, always available"]);
  form.addMultipleChoiceItem().setTitle("Do you have product photos ready?")
    .setChoiceValues(["Yes, good photos", "Some", "Need help with photos"]);

  // ── 4. Look & feel ─────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("4 · The Look & Feel")
    .setHelpText("This guides your colours and overall style.");
  form.addMultipleChoiceItem().setTitle("Which style fits your brand best?")
    .setChoiceValues([
      "Elegant & warm (gold tones)",
      "Premium & rich (deep, luxurious)",
      "Clean & modern (minimal, cool tones)",
      "Not sure — you decide",
    ]);
  form.addTextItem().setTitle("Do you have brand colours already? (names or codes like #1A2B3C)");
  form.addMultipleChoiceItem().setTitle("Do you have a logo?")
    .setChoiceValues(["Yes (I'll send the file)", "No"]);
  form.addParagraphTextItem().setTitle("Websites you like the look of (paste 1–3 links)");

  // ── 5. Homepage ────────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("5 · Your Homepage")
    .setHelpText("We can show or hide these sections, in any order.");
  form.addCheckboxItem().setTitle("What should the homepage highlight?")
    .setChoiceValues([
      "Big welcome banner",
      "Featured / best-selling products",
      "Product categories",
      "Why-shop-with-us (delivery, quality…)",
      "Customer reviews",
      "Newsletter sign-up",
    ]);
  form.addTextItem().setTitle("One short headline for the welcome banner")
    .setHelpText("e.g. \"Premium fashion, delivered to your door\".");

  // ── 6. Payments ────────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("6 · Getting Paid");
  form.addMultipleChoiceItem().setTitle("How do you want to receive payment?")
    .setChoiceValues([
      "Online (cards, transfer, USSD via Paystack)",
      "WhatsApp / manual for now",
      "Both",
    ]);
  form.addTextItem().setTitle("Currency");
  form.addMultipleChoiceItem().setTitle("Do you have a Paystack account?")
    .setChoiceValues(["Yes", "No", "Not sure"]);

  // ── 7. Delivery ────────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("7 · Delivery & Shipping");
  form.addTextItem().setTitle("Where do you deliver? (e.g. Lagos only, nationwide)");
  form.addParagraphTextItem().setTitle("Delivery options & fees")
    .setHelpText("e.g. Standard ₦3,000 / Express ₦7,000 / Pickup free.");
  form.addTextItem().setTitle("Roughly how long does delivery take?");

  // ── 8. Policies ────────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("8 · Policies & Info")
    .setHelpText("We'll draft the pages — just give the gist.");
  form.addParagraphTextItem().setTitle("Returns / exchange policy");
  form.addParagraphTextItem().setTitle("Common questions customers ask you (for the FAQ)");

  // ── 9. Domain & email ──────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("9 · Domain & Email");
  form.addTextItem().setTitle("Do you own a website address (domain)? If yes, what is it?");
  form.addTextItem().setTitle("Do you have a business email on that domain?");

  // ── 10. Files ────────────────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("10 · Please Send These Files")
    .setHelpText(
      "After submitting, please email or WhatsApp me: your logo, product photos, " +
      "and a product list (names, prices, sizes/colours, stock counts)."
    );

  // ── 11. Management & extras ─────────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("11 · Ongoing Help & Extras");
  form.addMultipleChoiceItem()
    .setTitle("After I set up your store and train you, would you like me to MANAGE it for you (uploading products, updates, etc.) for a monthly fee?")
    .setChoiceValues([
      "Yes please — manage it for me",
      "No — I'll manage it myself after training",
      "Maybe — tell me more",
    ]);
  form.addParagraphTextItem().setTitle("Anything else, ideas, or concerns?");
  form.addTextItem().setTitle("Ideal launch date (optional)");
  form.addTextItem().setTitle("Budget range (optional)");

  // ── Output the links ─────────────────────────────────────────────────────
  Logger.log("EDIT this form here:  " + form.getEditUrl());
  Logger.log("SEND clients this link: " + form.getPublishedUrl());
}
```

---

## Notes

- **Google Forms can't create file-upload questions via script** (and file
  upload requires the client to be signed into Google), so the form asks them to
  send logo/photos by email or WhatsApp instead — simpler for non-technical
  clients on a phone.
- To re-run with changes, edit the script and Run again — it creates a **new**
  form each time (delete old drafts from Drive if you don't want duplicates).
- The published (share) link is what you give clients; the edit link is for you.
