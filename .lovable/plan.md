
Goal: make ACH retry reliable when customers report “penny verification failed” and can’t restart (BMS case).

What I found:
- BMS application (`7c6ec643...`) is currently `payment_setup_status='pending'`, `stripe_payment_method_id=null`, `payment_method_type='ach'`.
- BMS has recent successful logins, so auth/role is not the blocker.
- Current flow can still get stuck because payment status logic trusts “any payment method on Stripe customer” and can mark setup complete even when method is stale/invalid for billing.
- Admin “reset” in Applications currently only clears DB fields; it does not clean Stripe-side stale ACH state.

Implementation plan:

1) Add a true “hard reset payment setup” backend function
- Create an admin-only backend function (e.g. `reset-payment-setup`) that:
  - Validates admin auth.
  - Loads application + Stripe customer.
  - Clears DB fields: `payment_setup_status='pending'`, `stripe_payment_method_id=null`.
  - Detaches stale bank methods from Stripe customer (and clears default invoice payment method when needed).
  - Returns a summary (`detachedCount`, `clearedDefault`, `applicationId`).

2) Wire admin Reset button to the new backend function
- Update `src/pages/admin/Applications.tsx` reset icon action to call the new function instead of direct table update.
- Keep existing toast/invalidate pattern, but include richer success text (“Reset complete, stale bank links removed”).

3) Harden `check-payment-status` so stale methods don’t block retries
- Update `supabase/functions/check-payment-status/index.ts` logic:
  - Only return `hasPaymentMethod=true` when the app is truly complete and the stored `stripe_payment_method_id` is present on the customer.
  - If app says `completed` but stored payment method is missing/detached, auto-reset to pending.
  - If app is `pending/sent` and Stripe has orphaned/stale methods, do NOT auto-mark complete.
- This prevents false “ACH ✓” states and keeps retry button available.

4) Improve customer-side ACH start failure handling
- In `src/pages/customer/PaymentSetup.tsx`:
  - Add timeout/guard around `collectBankAccountForSetup` so “prompt never opens” doesn’t hang silently.
  - Show explicit error guidance: “Open in Safari/Chrome (not in-app email browser), then retry.”
  - Keep one-click retry.

5) Add targeted diagnostics for future incidents
- Add structured logs in `create-ach-setup` and `check-payment-status` for:
  - app id, setup intent id, returned setup status, reset reason.
- This makes support triage fast without manual DB guesswork.

Files to update:
- `supabase/functions/reset-payment-setup/index.ts` (new)
- `src/pages/admin/Applications.tsx`
- `supabase/functions/check-payment-status/index.ts`
- `src/pages/customer/PaymentSetup.tsx`

Technical details (key rule changes):
- Replace “any Stripe PM exists => completed” with:
  - completed only if `payment_setup_status='completed'` AND stored PM id exists on Stripe customer.
- Reset conditions:
  - `completed + stored PM missing` => reset to pending.
  - `sent/pending + no valid stored PM` => keep retryable state.
- Preserve card flow by applying the same validity check for card PMs.

Validation plan:
1. Run hard reset for BMS from admin Applications.
2. Customer logs in and clicks “Link Bank Account” → ACH prompt must open.
3. Cancel mid-flow → status remains retryable.
4. Complete flow → `confirm-ach-setup` sets completed and linked PM id.
5. Re-open Payment Setup page → shows linked method (no false resets).
