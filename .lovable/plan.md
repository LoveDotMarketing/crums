
# Final System Audit: Remaining Issues

## Summary

After reviewing every edge function, the customer signup/application/ACH flow, admin subscription management, and the Stripe webhook handler, the system is in good shape. The CORS fixes and split-billing logic from previous rounds are working correctly. I found **2 remaining issues** -- one that will cause crashes when split billing is active, and one minor inconsistency.

---

## Issue 1: Stripe Webhook Crashes on Split-Billing Customers (HIGH)

**Where:** `supabase/functions/stripe-webhook/index.ts`, lines 337-341 and 422-427

**Problem:** The webhook has two fallback paths that look up subscriptions by `customer_id` when the primary `stripe_subscription_id` lookup fails. These use `.maybeSingle()`:

```typescript
const { data: custSub } = await supabase
  .from("customer_subscriptions")
  .select("id, customer_id")
  .eq("customer_id", customer.id)
  .in("status", ["active", "pending"])
  .maybeSingle();  // CRASHES if 2+ active subscriptions
```

Once Ground Link LLC (or any customer) has two subscriptions for split billing, `.maybeSingle()` will throw a Postgres error because there are multiple matching rows. This would cause payment-succeeded and payment-failed webhooks to fail silently, meaning payments won't be recorded and failure notifications won't be sent.

**Fix:** Change `.maybeSingle()` to `.limit(1).maybeSingle()` (or `.order('created_at', { ascending: false }).limit(1).maybeSingle()`) in both fallback locations. This ensures we pick the most recent subscription rather than crashing. The primary lookup path (by `stripe_subscription_id`) is unaffected since that field is unique.

---

## Issue 2: twilio-call-logs Has Old CORS Headers (LOW)

**Where:** `supabase/functions/twilio-call-logs/index.ts`, line 5

**Problem:** Still uses the minimal CORS header set:
```
'authorization, x-client-info, apikey, content-type'
```

This function IS called from the browser (admin CallLogs page), but currently via `fetch()` with only `Authorization` and `Content-Type` -- which are in the minimal list. So it works today, but if the code is ever refactored to use `supabase.functions.invoke()`, it will break. Should be updated for consistency.

**Fix:** Update to the full CORS header set.

---

## What Passed Final Review

| Area | Status | Notes |
|---|---|---|
| Signup (GetStarted.tsx) | OK | Session retry, localStorage persistence, upsert, referral codes |
| Login (Login.tsx) | OK | Rate limiting with SECURITY DEFINER functions, lockout, incomplete profile redirect |
| Application (Application.tsx) | OK | Auto-save debounce, session refresh guard, SSN encryption via ssn-crypto |
| Document uploads | OK | File validation, storage bucket paths, signed URLs |
| ACH setup (PaymentSetup.tsx) | OK | Stripe Financial Connections, cancellation/timeout handling |
| create-ach-setup | OK | Full CORS, proper auth, Stripe customer creation |
| confirm-ach-setup | OK | Full CORS, billing anchor persistence |
| check-payment-status | OK | Full CORS, auto-reconciles missing payment method records |
| ssn-crypto | OK | Full CORS, AES-256-GCM encryption, admin-only decryption |
| create-subscription | OK | Full CORS, split-billing support (trailer conflict check, not customer block) |
| activate-subscription | OK | Full CORS, ACH charge initiation |
| manage-subscription | OK | Full CORS, pause/resume/cancel |
| modify-subscription | OK | Full CORS, trailer add/remove/swap |
| process-billing | OK | Full CORS, cron scheduled daily 6am UTC |
| sync-payments | OK | Full CORS, cron scheduled daily 7am UTC |
| process-payment-failures | OK | Full CORS, dunning management |
| stripe-webhook | Partial | Primary path OK, fallback has split-billing crash risk |
| send-contact-email | OK | Full CORS, spam detection, rate limiting |
| send-rental-request-email | OK | Full CORS |
| send-ach-setup-email | OK | Full CORS, admin-only |
| send-application-status-email | OK | Full CORS |
| chat-proxy | OK | Full CORS, auth + rate limiting |
| All agent-* functions | OK | Use shared auth.ts with full CORS |
| RLS policies | OK | All tables have appropriate access control |
| Login rate limiting | OK | SECURITY DEFINER functions bypass RLS correctly |
| config.toml | OK | Customer-facing functions use verify_jwt=false with in-code auth |

---

## Technical Changes

| File | Change |
|---|---|
| `supabase/functions/stripe-webhook/index.ts` | Add `.limit(1)` before `.maybeSingle()` on two customer-id fallback queries (lines ~337-341 and ~422-427) to prevent crash when customer has multiple active subscriptions |
| `supabase/functions/twilio-call-logs/index.ts` | Update CORS headers to include full Supabase client headers for consistency |

Both changes are minimal, backward-compatible, and zero-risk.
