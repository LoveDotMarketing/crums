

## Fix $0 Invoice Bug in Subscription Activation

### Root cause

When `create-subscription` sets a `billing_cycle_anchor` (e.g., "bill on the 15th"), it also sets `proration_behavior: "none"` (line 425). This means Stripe generates a **$0 first invoice** — no prorated charge for the gap between "now" and the anchor date. Combined with `payment_behavior: "default_incomplete"`, Stripe auto-pays the $0 invoice and immediately marks the subscription **"active"**.

When the admin then clicks **Activate**, the function sees "active" and either:
- Charges just the deposit (if unpaid) — but the **recurring payment is never collected**
- Returns "already active" if deposit is also handled

Result: subscription is "active" in Stripe but **no real money was charged** until the anchor date arrives.

### Fix approach

**File: `supabase/functions/create-subscription/index.ts`**

When `billing_cycle_anchor` is set with `proration_behavior: "none"`, add the first period's recurring charges as one-time `add_invoice_items` on the initial invoice. This ensures the first invoice has a real dollar amount, keeps the subscription in "incomplete" status, and lets the Activate button charge it properly.

Changes (around lines 386-430):
- After creating the per-trailer Stripe prices for recurring billing, also create one-time price entries for each trailer's first-period charge
- Add these as `add_invoice_items` alongside the deposit (if any)
- This only applies when `anchorTimestamp` is set (i.e., when proration is skipped)

**File: `supabase/functions/activate-subscription/index.ts`**

Add a safety net for the "already active" path (lines 234-361):
- After checking deposit, also verify that at least one real payment (amount > 0) exists in Stripe for this subscription
- If not, create and charge a standalone invoice for the first period amount
- This handles any existing subscriptions that may have been created before the fix

### Technical details

```text
Current flow (broken):
  create-subscription → anchor + no proration → $0 invoice → auto-active
  activate → sees "active" → "already active" (no charge)

Fixed flow:
  create-subscription → anchor + no proration → adds first-period as invoice items
    → invoice = $700+ → stays "incomplete"
  activate → finds open invoice → charges it → subscription goes active
```

### Files changed
- `supabase/functions/create-subscription/index.ts` — add first-period charges as invoice items when using billing anchor
- `supabase/functions/activate-subscription/index.ts` — safety net to charge first period if subscription is active with no real payments

