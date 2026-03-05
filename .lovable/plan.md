

## Fix: ACH Guard Blocking Customers Set Up via Admin Path

### Problem
The error "Customer has no linked account" occurs because the ACH validation in `CreateSubscriptionDialog.tsx` (lines 228-248) only checks for a payment method via the **profile → user_id** path. Customers like Abdul who had ACH set up through the **admin-led customer_id path** (no auth profile) are incorrectly blocked.

The same gap exists in the **server-side guard** in `create-subscription/index.ts` (lines 149-171).

### Root Cause
Both guards do: `profiles.email → profile.id → customer_applications.user_id`. If no profile row exists, the client-side throws an error and the server-side skips the check entirely. Neither checks `customer_applications.customer_id` as a fallback — the path used by admin-led ACH setup.

### Fix (2 files)

**1. Client-side guard — `CreateSubscriptionDialog.tsx` (lines 228-248)**

Replace the current logic with a two-path check:
1. Try `profiles.email → user_id → customer_applications.stripe_payment_method_id` (existing path)
2. If no profile found, fall back to `customer_applications.customer_id` (admin-led path)
3. Only throw if **both** paths find no payment method

**2. Server-side guard — `create-subscription/index.ts` (lines 149-171)**

Same fix: after the profile lookup fails, add a fallback query checking `customer_applications` by `customer_id` directly. Only skip the guard if neither path returns a payment method.

### Changes Summary
- **`src/components/admin/CreateSubscriptionDialog.tsx`** — Update ACH guard (~lines 228-248) to add `customer_id` fallback query
- **`supabase/functions/create-subscription/index.ts`** — Update server-side ACH guard (~lines 149-171) to add `customer_id` fallback query

No database changes needed. The `customer_applications.customer_id` column already exists.

