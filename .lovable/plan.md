

# Comprehensive Workflow Audit: All Issues Found

## Summary

After a thorough review of every customer-facing and admin-facing flow -- signup, login, application, document upload, ACH setup, subscription creation, and billing management -- I found **1 critical systemic bug** affecting 16 edge functions and **1 logic bug** that blocks split billing.

---

## Issue 1: CORS Headers Missing on 16 Edge Functions (CRITICAL)

**Impact: Will cause silent failures across admin and customer workflows**

The same CORS bug we fixed on `ssn-crypto`, `create-subscription`, and `activate-subscription` exists on **16 more edge functions** that are called from the browser. The Supabase JS client sends headers like `x-supabase-client-platform` that the browser's CORS preflight rejects when they're not listed in `Access-Control-Allow-Headers`.

### Functions that WILL fail when called from the browser:

**Admin-facing (breaks admin dashboard operations):**
| Function | Used In | What Breaks |
|---|---|---|
| `manage-subscription` | Billing page | Pause/resume/cancel subscriptions |
| `modify-subscription` | ManageTrailersDialog | Add/remove/swap trailers on subscriptions |
| `process-billing` | Billing page | Manual billing sync |
| `sync-payments` | Billing page | Manual payment sync |
| `process-payment-failures` | Billing page | Dunning management |
| `retry-payment` | Billing page | Retry failed payments |
| `get-cron-history` | Billing page | View cron job history |
| `invite-staff` | Staff page | Invite new staff members |
| `remove-staff` | Staff page | Remove staff |
| `update-staff-role` | Staff page | Change staff roles |
| `send-application-status-email` | Applications page | Notify customers of approval/rejection |
| `send-outreach-email` | Outreach page | Send marketing emails |
| `process-outreach-automation` | Outreach page | Run automated outreach |
| `indexnow-submit` | SitemapGenerator, IndexNow | Submit URLs to search engines |
| `sync-development-changelog` | DevelopmentTab | Sync changelog |

**Customer/public-facing:**
| Function | Used In | What Breaks |
|---|---|---|
| `linkedin-capi` | GetStarted, Contact, Login | LinkedIn conversion tracking (non-critical but noisy errors) |
| `update-outreach-status` | Login, ResetPassword, Unsubscribe | Password-set tracking, unsubscribe flow |
| `send-contact-email` | Contact page | Public contact form submissions |
| `send-rental-request-email` | Rental request flow | Rental inquiry submissions |
| `chat-proxy` | ChatBot component | AI chatbot |

### Functions already fixed (no change needed):
`ssn-crypto`, `create-subscription`, `activate-subscription`, `check-payment-status`, `create-ach-setup`, `confirm-ach-setup`, `send-ach-setup-email`, `charge-toll`, `_shared/auth.ts`

### Fix:
Update the `corsHeaders` in all 20 affected functions to include the full Supabase client headers:
```
authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version
```

---

## Issue 2: create-subscription Blocks Multiple Subscriptions Per Customer

**Impact: Prevents split billing (e.g., Ground Link's $2,250 on 1st + $1,650 on 15th)**

In `create-subscription/index.ts` (lines 87-91), the function queries for existing subscriptions using `.maybeSingle()`:

```typescript
const { data: existingSubscription } = await supabaseClient
  .from("customer_subscriptions")
  .select("id, status, stripe_subscription_id")
  .eq("customer_id", customerId)
  .maybeSingle();  // ERROR if multiple rows exist
```

`.maybeSingle()` throws a Postgres error if there are multiple rows. So once a customer has their first active subscription, attempting to create a second one (for split billing on a different date) will crash with a database error before even reaching the business logic.

### Fix:
Change `.maybeSingle()` to a query that checks for any active/pending/paused subscription, then allow additional subscriptions if needed. The check should look for conflicts on the same trailers rather than blocking all new subscriptions for the customer.

---

## What Passed Review (No Issues)

- **Signup flow (GetStarted.tsx):** Session retry, localStorage persistence, upsert conflict handling, "already registered" redirect -- all solid
- **Login flow (Login.tsx):** Rate limiting, lockout, incomplete profile redirect -- working correctly
- **Application form (Application.tsx):** Auto-save with debounce, session refresh before submit, merge-not-overwrite pattern -- correct
- **Document uploads:** File validation, storage bucket upload, path-based storage -- working
- **ACH setup (PaymentSetup.tsx):** Stripe Financial Connections, error handling for cancellation/timeouts, network error detection -- robust
- **ACH edge functions:** `create-ach-setup`, `confirm-ach-setup`, `check-payment-status` -- all have correct CORS headers and proper auth
- **Application Status Tracker:** Correct 4-step progression, handles rejected state, payment setup status tracking -- clean
- **Customer Dashboard:** Real-time toll/trailer updates, subscription status checks, pending checkout queue -- all functional
- **Stripe webhook handler:** Has `stripe-signature` in allowed headers -- correct for webhook verification
- **RLS policies:** All tables have appropriate access control

---

## Technical Changes

| File | Change |
|---|---|
| `supabase/functions/manage-subscription/index.ts` | Update CORS headers |
| `supabase/functions/modify-subscription/index.ts` | Update CORS headers |
| `supabase/functions/process-billing/index.ts` | Update CORS headers |
| `supabase/functions/sync-payments/index.ts` | Update CORS headers |
| `supabase/functions/process-payment-failures/index.ts` | Update CORS headers |
| `supabase/functions/retry-payment/index.ts` | Update CORS headers |
| `supabase/functions/get-cron-history/index.ts` | Update CORS headers |
| `supabase/functions/invite-staff/index.ts` | Update CORS headers |
| `supabase/functions/remove-staff/index.ts` | Update CORS headers |
| `supabase/functions/update-staff-role/index.ts` | Update CORS headers |
| `supabase/functions/send-application-status-email/index.ts` | Update CORS headers |
| `supabase/functions/send-outreach-email/index.ts` | Update CORS headers |
| `supabase/functions/process-outreach-automation/index.ts` | Update CORS headers |
| `supabase/functions/indexnow-submit/index.ts` | Update CORS headers |
| `supabase/functions/sync-development-changelog/index.ts` | Update CORS headers |
| `supabase/functions/linkedin-capi/index.ts` | Update CORS headers |
| `supabase/functions/update-outreach-status/index.ts` | Update CORS headers |
| `supabase/functions/send-contact-email/index.ts` | Update CORS headers |
| `supabase/functions/send-rental-request-email/index.ts` | Update CORS headers |
| `supabase/functions/chat-proxy/index.ts` | Update CORS headers |
| `supabase/functions/create-subscription/index.ts` | Fix `.maybeSingle()` to support multiple subscriptions per customer |

All 21 files need a single-line CORS header update. The subscription fix requires a small logic change to the duplicate-check query.

