
Diagnosis

- Yes, there is a fresh backend log for the retry.
- It is not a login/session problem. The latest attempt shows:
  - `Function started`
  - `Admin verified`
  - customer lookup succeeded
  - trailer lookup succeeded
  - Stripe customer lookup succeeded
  - payment method lookup succeeded
- The failure happens later, inside Stripe subscription creation.

What the latest log says

- Fresh retries happened at:
  - 2026-04-08 01:23:54–01:23:56 UTC
  - 2026-04-08 01:24:21–01:24:25 UTC
- The error is:
  - `billing_cycle_anchor cannot be later than next natural billing date`
- The request is sending:
  - `firstBillingDate = 2026-05-15`
  - monthly billing
  - anchor day 15
- Stripe is rejecting that because the chosen first billing date is too far in the future for the current `billing_cycle_anchor` approach.

Important conclusion

- Telling them to log out and log back in would not fix this specific error.
- The request is already authenticated and reaching Stripe correctly.
- This is a billing-date logic issue, not a stale-session issue.

Extra note from the data

- The backend currently still sees this customer’s saved payment setup as `payment_method_type = ach`.
- That is not what caused this failure, but if you expected card, that is a separate issue and relogging would not change it.

Implementation plan

1. Fix `create-subscription` to handle far-future `firstBillingDate` values safely.
   - Keep current direct `billing_cycle_anchor` behavior only when the selected first billing date is within Stripe’s allowed window.
   - For farther-out dates, switch to a delayed-start strategy instead of sending an invalid anchor.

2. Update the first-period auto-charge safety net.
   - Right now it assumes “no real payment yet” means “charge now.”
   - That logic must skip intentional delayed starts, otherwise it will fight the future billing-date behavior.

3. Add validation in the admin subscription form.
   - If the selected first billing date is not valid for the current creation path, show a clear message before submission.
   - Make the UI explain whether the system will:
     - charge deposit now and start recurring later, or
     - reject the selected date.

4. Improve logging for future debugging.
   - Log which strategy was used:
     - direct anchor
     - delayed start
     - auto first-period charge
   - That will make these failures obvious immediately.

Immediate workaround

- Retry with `First Billing Date` cleared, or pick a nearer date.
- If the business requirement is specifically “charge deposit now, but start recurring billing on May 15,” the code needs the billing-date fix above. Relogging will not solve it.

Technical detail

- Main failing file: `supabase/functions/create-subscription/index.ts`
- Related UI: `src/components/admin/CreateSubscriptionDialog.tsx`
- The latest failing log is the Stripe create call, not auth:
  - `Stripe subscription creation failed: billing_cycle_anchor cannot be later than next natural billing date`
