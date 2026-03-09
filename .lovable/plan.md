

# Fix: Deposit Invoice Items Not Being Collected

## Problem
The `activate-subscription` edge function creates an invoice item ($800 deposit) and then a separate manual invoice, but the invoice ends up with $0. This is because Stripe's API (basil version) doesn't automatically attach pending invoice items to manually-created invoices when the customer has an active subscription — the items get reserved for the next subscription billing cycle instead.

This affects Roderick McGill's subscription (and potentially any future activation).

## Solution
Modify the deposit invoice creation in `activate-subscription/index.ts` to explicitly attach the invoice item to the deposit invoice by:

1. Creating the invoice **first** with `pending_invoice_items_behavior: 'exclude'` (so it doesn't accidentally pull in other items)
2. Creating the invoice item **with the `invoice` parameter** set to the new invoice's ID, which directly attaches it

## File Changes

**`supabase/functions/activate-subscription/index.ts`** (lines 253-265)

Replace the current flow:
```typescript
// Current (broken): item created first, then invoice — item never gets picked up
await stripe.invoiceItems.create({ customer, amount, ... });
const depositInvoice = await stripe.invoices.create({ customer, ... });
```

With:
```typescript
// Fixed: create invoice first, then attach item directly to it
const depositInvoice = await stripe.invoices.create({
  customer: chargeCustomerId,
  auto_advance: false,
  pending_invoice_items_behavior: 'exclude',
  metadata: { type: "security_deposit", subscription_id: subscription.stripe_subscription_id },
});

await stripe.invoiceItems.create({
  customer: chargeCustomerId,
  invoice: depositInvoice.id,
  amount: Math.round(depositAmount * 100),
  currency: "usd",
  description: "Security Deposit",
});
```

This same pattern also needs to be applied to the **incomplete/past_due path** if it has a similar deposit charging flow (it doesn't appear to, so only the active-with-unpaid-deposit path needs the fix).

## After Deployment
Once deployed, the admin can retry activation for Roderick McGill and the $800 deposit will be correctly charged. No database changes needed — the subscription and Stripe records are in a valid state, just the deposit hasn't been collected yet.

