
# Fix Brand Domain — Replace All Lovable/CDN URLs in Public-Facing Content

## What's Wrong

A full codebase audit found **no Lovable URLs in any React frontend code** — all pages, SEO components, structured data, and sitemaps correctly use `crumsleasing.com`.

The problems are entirely in **backend email functions** (4 files) and the **root `index.html`** OG image tag (1 file):

---

## Issues Found

### Issue 1 — `supabase/functions/send-outreach-email/index.ts` (Line 28)
```
const BASE_URL = "https://crums.lovable.app";
```
This `BASE_URL` is used to build links inside **all outreach emails** — login, profile, application, get-started, and unsubscribe links. Every customer who receives an outreach email today gets `crums.lovable.app` URLs.

**Fix:** Change to `"https://crumsleasing.com"`

---

### Issue 2 — `supabase/functions/retry-payment/index.ts` (Line 14)
```
const BASE_URL = "https://crums.lovable.app";
```
Used in payment retry notification emails — the "View Your Billing" and "Update Payment Method" CTA buttons both link to `crums.lovable.app/dashboard/customer/billing`.

**Fix:** Change to `"https://crumsleasing.com"`

---

### Issue 3 — `supabase/functions/send-ach-setup-email/index.ts` (Lines 75 & 237)
```
const setupUrl = "https://crums.lovable.app/dashboard/customer/payment-setup";
```
Hardcoded in **two separate places** — once for test mode (line 75) and once for production sends (line 237). This is the payment setup link sent to customers who need to complete ACH setup.

**Fix:** Change both to `"https://crumsleasing.com/dashboard/customer/payment-setup"`

---

### Issue 4 — `supabase/functions/stripe-webhook/index.ts` (Line 751)
```html
<a href="https://crums.lovable.app" style="color: #0066cc;">crums.lovable.app</a>
```
This appears in the email footer of **Stripe payment confirmation emails** sent to customers after every successful billing cycle. The visible link text also says `crums.lovable.app` — so customers literally see the Lovable URL.

**Fix:** Change to `<a href="https://crumsleasing.com">crumsleasing.com</a>`

---

### Issue 5 — `index.html` OG/Twitter Image (Lines 53–54)
```html
<meta property="og:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/...">
<meta name="twitter:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/...">
```
The base OG image in `index.html` points to a Google Cloud Storage bucket under the `gpt-engineer-file-uploads` project. While this still works, it's not a brand-owned URL and could break if that storage bucket changes. The SEO component (`SEO.tsx`) already correctly builds OG image URLs using `crumsleasing.com`, so these base tags in `index.html` are only the fallback — but they should still be cleaned up.

**Fix:** Change both to `https://crumsleasing.com/og-image.jpg` (which already exists in `/public`)

The favicon line using the same CDN URL (`link rel="icon" type="image/png"`) will also be removed as a duplicate — the next line already correctly references `/favicon.png`.

---

## Files to Change

| File | Lines | Change |
|---|---|---|
| `supabase/functions/send-outreach-email/index.ts` | 28 | `BASE_URL` → `https://crumsleasing.com` |
| `supabase/functions/retry-payment/index.ts` | 14 | `BASE_URL` → `https://crumsleasing.com` |
| `supabase/functions/send-ach-setup-email/index.ts` | 75, 237 | Both `setupUrl` → `https://crumsleasing.com/dashboard/customer/payment-setup` |
| `supabase/functions/stripe-webhook/index.ts` | 751 | Email footer link → `crumsleasing.com` |
| `index.html` | 5, 53–54 | OG/Twitter image → `/og-image.jpg` on brand domain; remove duplicate CDN favicon |

## No Database Changes Needed

This is purely URL string replacements across 5 files. The edge functions will redeploy automatically after the changes.
