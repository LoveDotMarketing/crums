
Diagnosis

- Yes, there is a fresh retry in the backend logs.
- It is not a logout/session issue. The request is reaching the backend, admin auth is passing, customer/trailer/payment lookup all succeed, and the new delayed-start code is clearly running.
- The current failure is now:
  - `Trial end (1778803200) cannot be after billing_cycle_anchor (1776211200).`

What that means

- The previous fix only solved half of the Stripe problem.
- The function now switches to `trial_end` for far-future `firstBillingDate` values, but it still also sets an earlier `billing_cycle_anchor` using `calculateNextAnchorDate(anchorDay)`.
- For Stevie’s request, the code is effectively sending:
  - `trial_end = 2026-05-15`
  - `billing_cycle_anchor = 2026-04-15`
- Stripe rejects that combination.

Implementation plan

1. Fix the delayed-start branch in `supabase/functions/create-subscription/index.ts`
   - When `firstBillingDate` is beyond the direct-anchor window, set `trial_end = firstBillingDate`.
   - Do not set `billing_cycle_anchor` at all in that delayed-start path.
   - Treat the explicit `firstBillingDate` as the true recurring start date.

2. Keep near-date behavior unchanged
   - If `firstBillingDate` is still within Stripe’s allowed window, continue using direct `billing_cycle_anchor = firstBillingDate`.
   - Keep `proration_behavior = "none"` so only the deposit is charged immediately.

3. Preserve the “subscribe = activate” behavior
   - Keep the standalone deposit invoice path exactly as the immediate charge path.
   - Keep the first-period safety net skipped for delayed starts so it does not create an extra recurring charge before May 15.

4. Tighten logs so this is obvious next time
   - Log which mode was used:
     - `direct_anchor`
     - `delayed_trial_only`
   - Log the final `trial_end` and whether `billing_cycle_anchor` was omitted.

5. Minor admin UI copy cleanup in `src/components/admin/CreateSubscriptionDialog.tsx`
   - Keep the warning, but make it explicit that:
     - deposit charges now
     - recurring billing starts on the selected date
     - no separate activation step is required

Why this should fix Stevie

- The latest logs show the only remaining blocker is the invalid Stripe combination.
- Once the delayed-start path stops sending the earlier `billing_cycle_anchor`, Stripe should accept the subscription.
- Expected result:
  - subscription creates successfully
  - deposit charges immediately
  - recurring billing begins on May 15
  - no logout/login required

Technical detail

- Main fix location: delayed-start block in `supabase/functions/create-subscription/index.ts` where `trial_end` is set and `billing_cycle_anchor` is currently also assigned.
- Secondary file: `src/components/admin/CreateSubscriptionDialog.tsx` for clearer delayed-start messaging.

Verification checklist

- Retry Stevie again with the same May 15 first billing date.
- Confirm logs show delayed-start mode without a `billing_cycle_anchor`.
- Confirm deposit invoice is created and paid.
- Confirm local subscription record is created.
- Confirm no first-period recurring invoice is charged immediately.
