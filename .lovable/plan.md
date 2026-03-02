

## Problem

The `activate-subscription` edge function rejects subscriptions with Stripe status `past_due` (line 101-103). Both subscriptions have moved from `incomplete` to `past_due` because Stripe's automatic retry failed (no payment method). The function only accepts `incomplete`.

## Fix

Update `activate-subscription` to also handle `past_due` subscriptions. For `past_due`, the latest invoice may be `open` — we retrieve it and pay it the same way. The logic is identical: find the open invoice, attach the payment method, pay.

### Changes to `supabase/functions/activate-subscription/index.ts`

1. **Line 101-103**: Change the status check from `=== "incomplete"` to allow both `incomplete` and `past_due`
2. **Line 120 (invoice status check)**: Also allow `open` invoices from `past_due` subscriptions — for `past_due`, we need to find the latest open invoice. If the latest invoice is not open, list recent open invoices for this subscription and pay the first one.

The key change:
```typescript
// Before
if (stripeSubscription.status !== "incomplete") {
  throw new Error(...);
}

// After  
if (!["incomplete", "past_due"].includes(stripeSubscription.status)) {
  throw new Error(...);
}
```

For `past_due` subscriptions, the latest invoice might already be `open` (failed first attempt). We pay it the same way — set default payment method, then `stripe.invoices.pay()`.

### File
- `supabase/functions/activate-subscription/index.ts` — Expand accepted statuses to include `past_due`

