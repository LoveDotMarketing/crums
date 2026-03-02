

## Problem Analysis

The Stripe dashboard shows both payments as **"Incomplete"** with **no payment method** attached. Here's the chain of events:

1. Subscriptions were created via `create-subscription` with `payment_behavior: "default_incomplete"` (line 341)
2. Stripe created invoices but could not charge because **no ACH bank account was linked** to these Stripe customers
3. The webhook `customer.subscription.updated` fired with status `past_due`
4. The `process-billing` edge function maps `past_due` → `active` in the local database
5. The admin billing UI only shows the "Activate" button when local status is `pending`, so it's now hidden
6. Result: subscriptions appear "Active" locally but Stripe cannot collect payment

Two fixes needed: **resolve the current incomplete payments** and **prevent this from happening again**.

## Plan

### 1. Fix the Activate button visibility

In `src/pages/admin/Billing.tsx` (around line 1311), update `isReadyToActivate` to also trigger for subscriptions that are locally "active" but have no billing history (meaning Stripe never successfully charged). This surfaces the Activate button for the two broken subscriptions.

Additionally, add a dropdown menu item "Activate Subscription" for **all** subscription statuses (not just pending), so admins can manually trigger invoice payment at any time.

### 2. Add ACH guard to subscription creation

In `src/pages/admin/Billing.tsx`, inside the Create Subscription dialog submission handler, check if the selected customer has a payment method on their Stripe customer before creating the subscription. If not, show a toast error: "Customer has no ACH payment method linked. Set up ACH on their profile first."

This check will be done by querying `customer_applications` for the selected customer's `stripe_payment_method_id`, which is set when ACH setup completes via `confirm-ach-setup`.

### 3. Fix status mapping to preserve `past_due` visibility

In `supabase/functions/process-billing/index.ts` (line 90) and `supabase/functions/create-subscription/index.ts` (line 280), change the `incomplete` status mapping from `"pending"` to keep it distinguishable. More importantly, add a `"past_due"` value to the database enum so admins can see when Stripe is failing to collect. Alternatively, surface a warning badge on the subscription row when Stripe status is `past_due` or `incomplete`.

Since adding a new enum value requires a migration, the simpler approach: keep `past_due` → `active` mapping but add a visual indicator. Query `billing_history` for the subscription — if the latest entry has `status: "failed"` or there are no entries at all despite the subscription being "active", show an amber warning badge.

### Files to change

- **`src/pages/admin/Billing.tsx`** — Expand `isReadyToActivate` logic; add ACH guard on subscription creation
- **`supabase/functions/create-subscription/index.ts`** — Add server-side check for payment method before creating Stripe subscription (defensive)

### Technical Details

The `isReadyToActivate` check (line 1311) changes from:
```
status === "pending" && stripe_subscription_id && stripe_customer_id
```
to also include:
```
status === "active" && stripe_subscription_id && no successful billing_history entries exist for this subscription
```

The ACH guard on the Create Subscription form will check:
```typescript
const application = await supabase
  .from("customer_applications")
  .select("stripe_payment_method_id")
  .eq("user_id", profileId)
  .maybeSingle();

if (!application?.stripe_payment_method_id) {
  toast.error("Set up ACH on the customer's profile first");
  return;
}
```

