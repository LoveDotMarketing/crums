

# Fix: Prevent Duplicate Charges (Double-Billing Protection)

This plan addresses the customer complaint about being charged $4,800 twice in one day. The root cause is insufficient duplicate protection at multiple layers.

## Root Causes Identified

1. **`create-subscription` edge function** — No idempotency key on `stripe.subscriptions.create()`. If the request is retried (network timeout, double-click race), Stripe creates duplicate subscriptions that both charge immediately.
2. **`charge-customer` edge function** — The audit log used for duplicate detection is written AFTER the Stripe charge completes. Two concurrent requests can both pass the duplicate check before either logs.
3. **No Stripe-level idempotency** — Neither function uses Stripe's built-in `idempotencyKey` parameter, which is the gold standard for preventing duplicate charges.

## Plan

### Step 1: Add Stripe idempotency keys to `create-subscription`
**File:** `supabase/functions/create-subscription/index.ts`

- Generate a deterministic idempotency key per subscription group: `create-sub_{customerId}_{groupKey}_{timestamp_bucket}` where timestamp_bucket is rounded to the nearest 10-minute window
- Pass this as `idempotencyKey` to `stripe.subscriptions.create()`
- This ensures Stripe itself rejects duplicate subscription creations within the same window

### Step 2: Fix race condition in `charge-customer` duplicate detection
**File:** `supabase/functions/charge-customer/index.ts`

- Write a "pending" audit log BEFORE calling Stripe (with status "pending")
- Update it to "completed" after Stripe succeeds
- Change duplicate detection to check for both "pending" and "completed" logs
- Add a Stripe idempotency key: `charge_{customerId}_{amountCents}_{10min_bucket}`

### Step 3: Add confirmation gate for large subscription creation
**File:** `src/components/admin/CreateSubscriptionDialog.tsx`

- For subscriptions with total monthly charges >= $2,000, add a type-to-confirm step (similar to the existing pattern in `ChargeCustomerDialog`)
- This provides a human speed bump against accidental double-submissions

### Step 4: Add server-side duplicate subscription guard
**File:** `supabase/functions/create-subscription/index.ts`

- Before creating a Stripe subscription, check if a subscription was already created for the same customer + trailer combination within the last 10 minutes
- Query `customer_subscriptions` + `subscription_items` for recent matching records
- Reject with a clear error message if a duplicate is detected

## Technical Details

**Stripe Idempotency Keys**: Stripe natively deduplicates API calls sharing the same idempotency key within 24 hours. This is the most reliable protection layer — even if our code runs twice, Stripe returns the original result.

**Time-bucketed keys**: Using `Math.floor(Date.now() / 600000)` (10-minute buckets) ensures that rapid retries hit the same key, while legitimate re-charges hours later get a fresh key.

**Pre-charge logging**: Moving the audit log insertion before the Stripe call (with a "pending" status) closes the race window where two concurrent requests both pass the duplicate check.

