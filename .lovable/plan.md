

## Fix: Sandbox subscriptions stuck on Processing / No Payment

The sandbox application correctly created a TEST-mode customer, subscription, and invoice in Stripe, and Stripe really did succeed the $1,000 charge. But three places downstream still assume LIVE mode, so the dashboard never updates.

### Root causes

1. **`create-subscription`** writes the new `customer_subscriptions` row with `sandbox=false` and the test customer/subscription IDs in the **live** columns (`stripe_customer_id`, `stripe_subscription_id`). Every later lookup then routes through the live Stripe key and fails to find the test objects.
2. **`stripe-webhook`** only verifies signatures with the **live** signing secret + live client. Test-mode `invoice.paid` events fail signature verification → `billing_history` stays `processing` forever.
3. **`check-payment-status`** always uses the live Stripe key, so it returns `"No such customer: cus_UNqYgm78iIH4tu"` → frontend auto-resets to "No payment method."

### Changes

**1. `supabase/migrations/...` — extend `customer_subscriptions` schema**

```sql
ALTER TABLE customer_subscriptions
  ADD COLUMN IF NOT EXISTS sandbox_stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES customer_applications(id);
```
(The `sandbox` and `sandbox_stripe_customer_id` columns already exist.)

**2. `supabase/functions/create-subscription/index.ts`**
- When `isSandboxApp === true`, persist the new sub with:
  - `sandbox: true`
  - `sandbox_stripe_customer_id: <test cus_…>`
  - `sandbox_stripe_subscription_id: <test sub_…>`
  - leave `stripe_customer_id` / `stripe_subscription_id` NULL
- `application_id` always populated so downstream tooling can resolve mode without joining by email.

**3. `supabase/functions/stripe-webhook/index.ts` — dual-mode signature verification**
- Try live signing secret + live client first.
- On signature failure, retry with `STRIPE_WEBHOOK_SIGNING_SECRET_TEST` + `getTestClientOrNull()`.
- Pass the resolved `stripe` client into all handlers so test-mode `invoice.paid` flips the right `billing_history` row to `succeeded` and updates `customer_subscriptions.deposit_paid_at` / `last_payment_status`.
- Resolve the `customer_subscriptions` row by checking BOTH `stripe_subscription_id` and `sandbox_stripe_subscription_id`.

**4. `supabase/functions/check-payment-status/index.ts`**
- Read `application.sandbox` + `application.sandbox_stripe_customer_id` alongside the live fields.
- Pick `STRIPE_TEST_SECRET_KEY` and the sandbox customer id when `sandbox=true`.
- Removes the spurious "No such customer" → "No Payment" auto-reset on sandbox accounts.

**5. Backfill the existing stuck row (one-time, in same migration)**

```sql
-- Mark the orphaned sandbox sub correctly
UPDATE customer_subscriptions
SET sandbox = true,
    sandbox_stripe_customer_id = stripe_customer_id,
    sandbox_stripe_subscription_id = stripe_subscription_id,
    stripe_customer_id = NULL,
    stripe_subscription_id = NULL
WHERE id = '7b024be1-416e-4103-ba00-a844f3e4daaa';

-- Mark the deposit invoice as succeeded (Stripe shows it paid)
UPDATE billing_history
SET status = 'succeeded',
    paid_at = now(),
    stripe_mode = 'test'
WHERE stripe_invoice_id = 'in_1TP50oPtmYCiZhW2VI1ceBgQ';

UPDATE customer_subscriptions
SET deposit_paid = true,
    deposit_paid_at = now()
WHERE id = '7b024be1-416e-4103-ba00-a844f3e4daaa';
```

**6. Webhook configuration reminder (manual, after deploy)**
You'll need to add a webhook endpoint in your **Stripe TEST dashboard** pointing to the same `stripe-webhook` URL, and store its signing secret as `STRIPE_WEBHOOK_SIGNING_SECRET_TEST` (already in your secrets list ✓). Without that endpoint registered in test mode, no future test events will reach the function.

### Verification

1. After deploy + backfill, open Mark's customer page → the deposit/processing row should flip to **Succeeded $1,000**, the **No Payment** badge disappears, and the subscription row shows live status.
2. Charge a second test invoice in Stripe sandbox → confirm `stripe-webhook` logs `Webhook event received { type: "invoice.paid" }` and the `billing_history` row updates within seconds.
3. The "Processing" pill on the Billing list should resolve to a normal status badge.

### Out of scope

- No frontend-only changes; the UI already renders the right state once the data is correct.
- No changes to `confirm-ach-setup` / `create-ach-setup` — those already handle sandbox correctly.
- No changes to `void-charge` / other admin actions — they already use `getStripeClient` which will work once the sub row carries the right `sandbox` flag.

