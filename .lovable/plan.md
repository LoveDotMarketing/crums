

## Problem

Both Ground Link and Jean show **"Active"** status with a **"Pending"** button. The user wants Ground Link to show:
1. **Status column**: "Pending" (not "Active")  
2. **Actions column**: "Activate" button (not "Pending" spinner)

**Root cause**: The `activate-subscription` edge function sets the local `customer_subscriptions.status` to `"active"` immediately, even when the Stripe payment didn't actually succeed. Both subscriptions are `past_due` in Stripe, meaning the payment attempt failed or is still pending. The billing_history records created during activation have `status: "pending"`, which makes the UI show a "Pending" spinner instead of an "Activate" button.

**Database state right now:**
- Ground Link: local status = `active`, Stripe status = `past_due`, billing_history = `pending`
- Jean: local status = `active`, Stripe status = `past_due`, billing_history = `pending`

## Fix (2 parts)

### 1. Fix `activate-subscription` edge function — don't set status to "active" prematurely

**File**: `supabase/functions/activate-subscription/index.ts`

After calling `stripe.invoices.pay()`, re-check the Stripe subscription status before updating the local status. Only set to `"active"` if Stripe confirms it. If Stripe still shows `incomplete` or `past_due`, keep the local status as `"pending"`.

```typescript
// After paying, re-retrieve subscription to check actual status
const updatedStripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
const localStatus = updatedStripeSub.status === "active" ? "active" : "pending";

await supabaseClient
  .from("customer_subscriptions")
  .update({
    status: localStatus,
    next_billing_date: ...
  })
  .eq("id", subscriptionId);
```

### 2. Fix the billing UI logic — show "Activate" for pending subs with failed prior attempts

**File**: `src/pages/admin/Billing.tsx` (lines ~1316-1353)

Update the status/action logic:
- If `sub.status === "pending"` and has `stripe_subscription_id` and `stripe_customer_id` → show **"Activate"** button (regardless of prior attempts — they should be retryable)
- Remove `!hasAttemptedActivation` from `isReadyToActivate` so that previously-failed activations can be retried
- The status badge already handles `"pending"` correctly via `getStatusBadge()`

### 3. Fix existing data — update Ground Link's local status back to "pending"

Run a database migration to correct Ground Link's status from `"active"` to `"pending"`, since Stripe shows `past_due` (payment hasn't cleared).

```sql
UPDATE customer_subscriptions 
SET status = 'pending' 
WHERE id = 'c232ab1a-9fdc-438f-ae70-93aba3000803';
```

### 4. Update sync functions to map `past_due` more carefully

**Files**: `sync-payments`, `process-billing`, `stripe-webhook`

Currently `past_due` maps to `"active"`. Change it to only map to `"active"` if there has been at least one successful payment (meaning it was active before and is now past_due on renewal). For first-time subscriptions that never had a successful payment, `past_due` should map to `"pending"`.

This is a targeted change in the `statusMap` logic — instead of a static map, check billing history:

```typescript
// In statusMap, change past_due handling:
let mappedStatus;
if (stripeSub.status === "past_due") {
  // Check if subscription ever had a successful payment
  const { data: successPayments } = await supabaseClient
    .from("billing_history")
    .select("id")
    .eq("subscription_id", sub.id)
    .eq("status", "succeeded")
    .limit(1);
  mappedStatus = successPayments?.length ? "active" : "pending";
} else {
  mappedStatus = statusMap[stripeSub.status] ?? sub.status ?? "pending";
}
```

### Files to change
- `supabase/functions/activate-subscription/index.ts` — Don't set "active" until Stripe confirms
- `src/pages/admin/Billing.tsx` — Allow re-activation of pending subs with prior attempts  
- `supabase/functions/sync-payments/index.ts` — Smart `past_due` mapping
- `supabase/functions/process-billing/index.ts` — Smart `past_due` mapping
- Database migration — Fix Ground Link's status to "pending"

