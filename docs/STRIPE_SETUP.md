# Stripe setup — LocalTour merchant tiers (WS4)

LocalTour uses **Stripe Payment Links** — no checkout code, no server. You create
the links in the Stripe Dashboard and paste the URLs into one data file
(`public/pricing.json`). The partners page renders those as data, so prices and
links are never hard-coded in the app.

Two paid tiers need links: **Partner** and **Anchor**. **Curated** is free/earned —
no Stripe.

---

## 1. Create a Stripe account (~10 min)

1. Go to <https://dashboard.stripe.com/register>, sign up with the LocalTour /
   SH@W Labs business email.
2. Activate payments: add business details + a bank account for payouts
   (Dashboard → **Settings → Business**). You can build the links in **Test mode**
   before activation — see step 5.

## 2. Create the two products (recurring)

Dashboard → **Product catalog → Add product** (do this twice):

| Product name        | Price   | Billing period | Notes                         |
| ------------------- | ------- | -------------- | ----------------------------- |
| LocalTour Partner   | $49.00  | Monthly        | Priority + coupon clipper + stats |
| LocalTour Anchor    | $199.00 | Monthly        | Category anchor + all Partner perks |

> Prices are the placeholders currently in `pricing.json` — change them to whatever
> you decide; just keep the Stripe price and the `pricing.json` number in sync.
> Prefer annual? Add a second price on the same product and make a second link.

## 3. Turn each product into a Payment Link

Dashboard → **Payment Links → + New**:

1. **Product** → pick *LocalTour Partner* (its monthly price).
2. Under **Options**:
   - **Collect customer info** → turn on **Name** and **Email** (you need the email
     to send them their stats dashboard link — see step 7).
   - Optionally add a custom field "Business name" and "City".
   - **Allow promotion codes** → on (lets you comp/discount early merchants).
   - **After payment** → **Show confirmation page** (or redirect to
     `https://localtour.directory/company/partners.html`). Add a confirmation
     message: "You're in. We'll email your dashboard link within a day."
3. **Create link** → copy the URL (looks like `https://buy.stripe.com/xxxxxxxx`).
4. Repeat for **Anchor**.

## 4. Paste the two URLs into `pricing.json`

Edit `public/pricing.json` — replace the `REPLACE_WITH_STRIPE_PAYMENT_LINK`
placeholders and update `price` if you changed it:

```json
{
  "id": "partner",
  "price": 49,
  "stripe_url": "https://buy.stripe.com/PASTE_PARTNER_LINK"
},
{
  "id": "anchor",
  "price": 199,
  "stripe_url": "https://buy.stripe.com/PASTE_ANCHOR_LINK"
}
```

Commit + redeploy (or just redeploy the site). The partners page immediately shows
live "Become a Partner / Anchor" buttons pointing at Stripe. **No other code
changes.** Until you paste real links, the buttons render as
"Coming soon — contact us" and scroll to the intake form (never a broken link).

## 5. Test mode first (recommended)

- Toggle **Test mode** (top-right of the Dashboard) and build the links there first.
- Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.
- **Test and Live links are different URLs.** When you go live, recreate the two
  Payment Links in Live mode and paste the *live* URLs into `pricing.json`.

## 6. The full merchant loop (how a stranger becomes a paying, tracked merchant)

1. Merchant submits the **intake form** on the partners page (Netlify Form —
   you get an email + it's in Netlify → Forms).
2. Merchant clicks **Become a Partner/Anchor** → pays via the Stripe Payment Link.
   You get the Stripe payment + their email.
3. You issue their **stats dashboard** magic link (WS3):
   ```
   export NETLIFY_SITE_ID=307ea660-1618-4355-9520-1e23dda757f7
   export NETLIFY_API_TOKEN=<your Netlify personal access token>
   npm run issue-token -- --city <slug> --biz "<Business Name>"
   ```
   Email them the printed `https://…/partners/stats?k=<token>` URL.
4. They see 30-day views, click-outs, coupon reveals, and redemptions — the
   product they paid for. **You wrote no code in that loop.**

## 7. (Optional, later) Log purchases automatically

Right now you reconcile payments by hand (Stripe emails + dashboard). When volume
justifies it, add a `netlify/functions/stripe-webhook.ts` that verifies Stripe's
signature and logs each purchase to Netlify Blobs (same store layer as WS3). That
needs one env var — the webhook signing secret (`STRIPE_WEBHOOK_SECRET`) — set in
**Netlify → Site settings → Environment variables**. Ask me to build it when you're
ready; it's ~30 lines and doesn't change the checkout (Payment Links stay no-code).

---

**TL;DR:** make 2 Payment Links (Partner, Anchor) → paste the 2 URLs into
`public/pricing.json` → redeploy. Everything else is already wired.
