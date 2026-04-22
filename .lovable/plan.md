

## Plan: Sandbox application flag

Let admins flag a customer's **application** for sandbox before they reach payment setup, so the entire ACH/card linking flow runs against Stripe **test mode** — no real bank ever touched. The downstream subscription auto-inherits sandbox.

### 1. Schema (one migration)

Add to `customer_applications`:
| column | type | notes |
|---|---|---|
| `sandbox` | boolean NOT NULL DEFAULT false | per-application sandbox flag |
| `stripe_mode` | text NOT NULL DEFAULT 'live' | stamped by edge functions: `'live'` or `'test'` |
| `sandbox_stripe_customer_id` | text NULL | test-mode customer reused on retries |

Extend the existing `subscription_sandbox_audit` table with a nullable `application_id uuid` column so one immutable audit log covers both application and subscription toggles. Update the index to `(application_id, changed_at DESC)` alongside the existing subscription index. RLS unchanged (admin-only).

### 2. New edge function: `toggle-application-sandbox`

Mirrors `enable-sandbox`/`disable-sandbox` shape:
1. Verify Bearer token + admin role.
2. Read current `sandbox` from `customer_applications`.
3. **Guard:** reject if `payment_setup_status === 'completed'` AND switching to live (would orphan a test PM). Allow with explicit `force: true` flag (which also clears `stripe_payment_method_id` so customer is re-prompted to set up payment in live mode).
4. `UPDATE customer_applications SET sandbox = $new WHERE id = $1`.
5. Insert audit row with `application_id`, `from_sandbox`, `to_sandbox`, `changed_by`, `reason`.
6. Append `app_event_logs` row (`event_type: 'application_sandbox_toggled'`).

### 3. Edge function changes

**`create-ach-setup`** — at the top, fetch the customer's application row. If `application.sandbox === true`:
- Use `STRIPE_TEST_SECRET_KEY` instead of `STRIPE_SECRET_KEY`.
- Reuse `sandbox_stripe_customer_id` if present; otherwise create a test-mode Stripe customer with metadata `{ source: 'lovable_admin_sandbox', live_application_id: <id> }` and persist the new ID to `sandbox_stripe_customer_id`.
- Stamp `stripe_mode = 'test'` on the application before returning the SetupIntent.

**`confirm-ach-setup`** — same key-selection branch based on `application.sandbox`.

**`create-subscription`** — when activating an application, if `application.sandbox === true`, set `customer_subscriptions.sandbox = true` and `sandbox_stripe_customer_id = application.sandbox_stripe_customer_id` automatically. Use the test secret key for the Stripe subscription/PM operations.

### 4. Frontend — publishable key resolution

Currently `payment-setup` loads Stripe.js with the **live** publishable key. Change `useStripeKey` (or wherever the publishable key is fetched) to also read the application's `stripe_mode` and pick test vs live publishable key. Add `STRIPE_TEST_PUBLISHABLE_KEY` to secrets if not already present (we already have `STRIPE_TEST_SECRET_KEY` and `STRIPE_WEBHOOK_SIGNING_SECRET_TEST`).

If the test publishable key isn't configured, the toggle UI shows an inline warning ("Add `STRIPE_TEST_PUBLISHABLE_KEY` secret to enable sandbox applications").

### 5. UI — Customer Detail page (`src/pages/admin/CustomerDetail.tsx`)

In the application section header, add a **Sandbox Application** card matching the subscription sandbox card visual:
- Switch + amber **Sandbox** badge when on
- Confirmation `AlertDialog` with bullets explaining the impact + optional reason `Textarea`
- When on, persistent amber banner at the top of the customer detail page: *"This customer's application is in SANDBOX mode — payment setup runs against Stripe test mode."*

### 6. UI — Applications list (`src/pages/admin/Applications.tsx`)

Add a **Mode** column with amber **Sandbox** badge for `sandbox=true` rows. Add the same `Sandbox only / Live only / All` filter chip pattern used on Billing.

### 7. UI — Customer-facing payment setup

Zero visible changes. The Stripe Elements iframe just loads with the test publishable key when applicable. No badges, no banners — matches the "customers see nothing" rule.

### 8. Files

1. **Migration** — add 3 columns to `customer_applications` + `application_id` to `subscription_sandbox_audit` + new index.
2. `supabase/functions/toggle-application-sandbox/index.ts` — new function.
3. `supabase/functions/create-ach-setup/index.ts` — branch on `application.sandbox`.
4. `supabase/functions/confirm-ach-setup/index.ts` — branch on `application.sandbox`.
5. `supabase/functions/create-subscription/index.ts` — inherit sandbox flag.
6. `src/pages/customer/PaymentSetup.tsx` (and any `useStripeKey` helper) — resolve publishable key from application's `stripe_mode`.
7. `src/pages/admin/CustomerDetail.tsx` — sandbox card + banner.
8. `src/pages/admin/Applications.tsx` — Mode column + filter chip.
9. `src/components/admin/SandboxActivityPanel.tsx` — render `application_id` rows alongside subscription rows (e.g., "Application: Mark Solis — Live → Sandbox").
10. `src/integrations/supabase/types.ts` — auto-regenerated.

### Test flow after build

1. Admin adds `STRIPE_TEST_PUBLISHABLE_KEY` secret.
2. Admin opens Mark Solis's customer page → flips **Sandbox Application** on → reason "Test account."
3. Mark logs in, completes the application, clicks **Set up payment**.
4. Stripe Elements loads in test mode. Mark enters routing `110000000` / account `000123456789` (or card `4242…`). ACH "links" instantly.
5. Admin approves → activates subscription → it auto-inherits `sandbox=true`, reuses the test Stripe customer.
6. All future charges run against Stripe test mode. Mark's portal looks identical to a live customer.

### Out of scope

- No automatic switch back to live after testing — admin must explicitly toggle off (with the guard around completed payment setup).
- No bulk "create test customer" wizard — the existing signup + this toggle is the path.
- No separate "sandbox" badge on the public signup form — sandbox is set after signup, by an admin.
- No reason-required policy.

