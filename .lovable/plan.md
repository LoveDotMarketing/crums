

# Customer Flow Audit: Issues Found and Fixes

## Summary

After reviewing the complete signup, application, ACH setup, and billing flows, I found **3 concrete bugs** that will cause failures for customers, plus **1 preventative fix** to avoid future breakage.

---

## Issue 1: SSN Encryption Will Fail (CORS Headers Missing)

**Severity: HIGH -- will block application submission when customers enter SSN**

The `ssn-crypto` edge function uses minimal CORS headers:
```
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
```

But `supabase.functions.invoke()` sends additional headers (`x-supabase-client-platform`, `x-supabase-client-platform-version`, etc.). The browser's CORS preflight will reject these, causing the SSN encryption call to fail silently, which then blocks the entire application submission.

**Fix:** Update `ssn-crypto` CORS headers to include the full set.

---

## Issue 2: Subscription Creation Will Fail (CORS Headers Missing)

**Severity: HIGH -- blocks admin from creating subscriptions for customers**

The `create-subscription` edge function has the same minimal CORS headers. When an admin tries to create a subscription for a customer (like Ground Link LLC), the CORS preflight will fail.

**Fix:** Update `create-subscription` CORS headers.

---

## Issue 3: Subscription Activation Will Fail (CORS Headers Missing)

**Severity: HIGH -- blocks admin from activating subscriptions**

The `activate-subscription` edge function also has minimal CORS headers. This prevents the admin from clicking "Activate" to charge the first invoice after ACH is linked.

**Fix:** Update `activate-subscription` CORS headers.

---

## Issue 4: `verify_jwt = true` on Customer-Facing Functions (Preventative)

**Severity: MEDIUM -- will break if signing-keys are enabled**

Several customer-facing functions use the deprecated `verify_jwt = true` in `config.toml`:
- `create-ach-setup`
- `check-payment-status`
- `confirm-ach-setup`
- `ssn-crypto`
- `send-application-status-email`

These currently work, but the recommended pattern is `verify_jwt = false` with in-code JWT validation. Since these functions already validate auth in their code (via `supabase.auth.getUser(token)`), switching to `verify_jwt = false` is safe and prevents future breakage.

**Fix:** Set `verify_jwt = false` for these functions in `config.toml`. No code changes needed since they already validate auth internally.

---

## What Passed Review (No Issues Found)

- **Signup flow (GetStarted.tsx):** Session retry logic, localStorage persistence, upsert conflict handling, "already registered" redirect -- all solid.
- **Login flow (Login.tsx):** Rate limiting, lockout, incomplete profile redirect, application record creation -- all working.
- **Application form (Application.tsx):** Auto-save with debounce, session refresh before upsert, merge-not-overwrite pattern -- all correct.
- **ACH setup (PaymentSetup.tsx):** Stripe Financial Connections flow, error handling for cancellation/timeouts, network error detection -- all good.
- **ACH edge functions:** `create-ach-setup`, `confirm-ach-setup`, `check-payment-status` all have correct CORS headers and proper auth.
- **RLS policies:** `customer_applications` allows INSERT/UPDATE/SELECT by owner. `profiles` allows UPDATE/SELECT by owner. `user_roles` allows SELECT by owner. All correct.
- **Race conditions:** The `getSessionWithRetry` helper handles mobile network latency. Upserts with `onConflict: 'user_id'` prevent duplicate records. Session refresh guard before application submit prevents expired-session RLS errors.

---

## Technical Changes

| File | Change |
|---|---|
| `supabase/functions/ssn-crypto/index.ts` | Update CORS headers to include full Supabase client headers |
| `supabase/functions/create-subscription/index.ts` | Update CORS headers to include full Supabase client headers |
| `supabase/functions/activate-subscription/index.ts` | Update CORS headers to include full Supabase client headers |
| `supabase/config.toml` | Set `verify_jwt = false` for `ssn-crypto`, `create-ach-setup`, `check-payment-status`, `confirm-ach-setup`, `send-ach-setup-email`, `send-application-status-email` |

All changes are backward-compatible. The auth validation already exists in the function code itself, so removing the gateway-level JWT check simply prevents a potential double-rejection scenario.

