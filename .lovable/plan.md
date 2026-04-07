

## Fix: Payment Method Selection Ignores Customer Preference

### Problem
Gerald Porter's `payment_method_type` is set to `card` in the database, but both `create-subscription` and `activate-subscription` always pick ACH payment methods first (via `resolveAchPaymentMethodId`). Gerald has an unverified ACH method AND a working card on file. The system chose the ACH method, which failed — so neither the $1,000 deposit nor the $833 first invoice were successfully charged.

### Root Cause
The `resolveAchPaymentMethodId` function in `activate-subscription/index.ts` (lines 15-111) hardcodes the priority: ACH first, card second. It never checks the customer's `payment_method_type` preference from the database.

Similarly, `create-subscription/index.ts` picks the verified PM from `customer_applications.stripe_payment_method_id` without considering the preferred type.

### Fix (2 files)

**1. `supabase/functions/activate-subscription/index.ts`**
- Rename `resolveAchPaymentMethodId` → `resolvePaymentMethodId`
- Accept an optional `preferredType` parameter (`"ach"` or `"card"`)
- When `preferredType` is `"card"`, check card methods first, then ACH as fallback
- When `preferredType` is `"ach"` or unset, keep existing behavior (ACH first, card fallback)
- Where this function is called (3 places in the file), pass the customer's `payment_method_type` from the subscription's customer record

**2. `supabase/functions/create-subscription/index.ts`**
- After looking up the customer, also fetch `payment_method_type` from the `customer_applications` table
- When the customer's preferred type is `card`, look for a card PM on the Stripe customer to use as `default_payment_method` on the subscription and deposit invoice (instead of always using the stored PM which may be ACH)

### Immediate Data Fix
After deploying, Gerald Porter's subscription needs to be retried:
1. The failed deposit and subscription invoices need to be voided/retried using his card payment method
2. Or run sync-payments after the fix to let the system retry with the correct PM

### Why This Matters
Any customer who has both ACH and card on file but prefers card will hit this same bug — the system will always use the (potentially unverified) ACH method.

