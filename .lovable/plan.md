

## Fix Abdul's Payment Setup Issue

### Root Cause
Abdul has a stale Stripe customer ID (`cus_U5sQ2ohTsvdzXt`) stored in his `customer_applications` record that likely doesn't exist under the current live Stripe API key. When the `create-ach-setup` function tries to create a SetupIntent against this customer, Stripe returns an error. Additionally, there are two Stripe customer records for his email — the system needs a clean slate.

### Plan

**1. Database migration — reset Abdul's stale Stripe data**

Clear the orphaned Stripe customer ID so the `create-ach-setup` function creates a fresh Stripe customer under the current live key:

```sql
UPDATE customer_applications
SET stripe_customer_id = NULL,
    stripe_payment_method_id = NULL,
    payment_setup_status = 'pending'
WHERE id = '25b5046d-d4b2-405c-bf78-ba3e2b71039f';
```

**2. Add error resilience to `create-ach-setup` edge function**

In `supabase/functions/create-ach-setup/index.ts`, wrap the Stripe customer retrieval in a try/catch so that if the stored `stripe_customer_id` is invalid (deleted, wrong mode), the function automatically creates a new customer instead of failing:

- After line ~143 where it uses `customerId_stripe`, add a verification step: call `stripe.customers.retrieve(customerId_stripe)` inside a try/catch
- If it throws (customer doesn't exist), log a warning, fall through to the "search by email / create new" path
- Update the application record with the new valid customer ID

This prevents this class of issue from ever happening again for any customer.

### Files to change
- **Database migration** — one UPDATE for Abdul's record
- `supabase/functions/create-ach-setup/index.ts` — add ~10 lines of Stripe customer validation with fallback

