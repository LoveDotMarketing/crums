

## Plan: Remove First-Period Safety Net from Subscription Creation

### Problem
The `create-subscription` edge function has a "first-period safety net" (lines 790-921) that automatically creates and charges a separate invoice for the first month's rent whenever a subscription starts on the same day. This caused the unexpected $800 charge. The business rule is: **only the deposit is charged immediately; the monthly trailer fee always bills on the scheduled billing date, never same-day.**

### Change

**File: `supabase/functions/create-subscription/index.ts`**

Delete the entire first-period safety net block (lines 789-921) — approximately 130 lines of code. This includes:
- The Stripe invoice list check for "real payments"
- Payment method resolution for first-period
- First-period invoice creation, line items, card surcharge, finalization, and payment
- The associated audit log insert and billing_history insert
- The "no payment method found" warning

After removal, subscription creation will:
1. Create the Stripe subscription (deferred to the billing anchor date)
2. Charge the security deposit only
3. Log the deposit — done

The monthly fee will naturally bill on the 1st or 15th (the `billing_cycle_anchor`) as Stripe handles recurring invoicing automatically.

### What stays unchanged
- Deposit invoice logic (lines 774-787) — untouched
- Delayed start logic — untouched
- All other subscription creation flow — untouched
- The audit logging we just added for subscription creation and deposit — stays

