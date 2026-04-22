

## Plan: Add Sandbox Application toggle UI

Build the missing admin UI so you can flip the sandbox flag on Mark's application from the dashboard, then we'll wire up the test publishable key.

### 1. CustomerDetail page — Sandbox Application card

In `src/pages/admin/CustomerDetail.tsx`, in the application section, add a card matching the existing subscription sandbox card pattern:
- **Switch** + amber **Sandbox** badge when on
- **Confirmation `AlertDialog`** with bullets explaining impact + optional reason `Textarea`
- Calls the `toggle-application-sandbox` edge function with `{ applicationId, enable, reason, force? }`
- On success: toast + refetch application
- On 409 `requiresForce`: second confirmation dialog warning that the customer's stored payment method will be cleared, then retries with `force: true`

When `application.sandbox === true`, render a persistent **amber banner** at the top of the customer detail page:
> *"This customer's application is in SANDBOX mode — payment setup runs against Stripe test mode. No real bank or card will be charged."*

### 2. Applications list — Mode column + filter

In `src/pages/admin/Applications.tsx`:
- Add a **Mode** column showing an amber **Sandbox** badge when `sandbox = true`, otherwise nothing (keeps live rows visually clean)
- Add a filter chip group: **All / Live only / Sandbox only** matching the Billing page pattern

### 3. SandboxActivityPanel — show application rows

In `src/components/admin/SandboxActivityPanel.tsx`, extend the audit query to include rows where `application_id IS NOT NULL` and render them with a different label prefix:
- Subscription rows: *"Subscription #1234 — Live → Sandbox by Eric"*
- Application rows: *"Application: Mark Solis — Live → Sandbox by Eric"*

Resolve application → customer name via a join on `customer_applications` → `customers` / `profiles`.

### 4. Files

1. `src/pages/admin/CustomerDetail.tsx` — sandbox card, confirmation dialog, force-retry path, amber banner
2. `src/pages/admin/Applications.tsx` — Mode column + filter chip group
3. `src/components/admin/SandboxActivityPanel.tsx` — render application audit rows alongside subscription rows

### Out of scope (this round)

- `STRIPE_TEST_PUBLISHABLE_KEY` secret — you'll add this after the UI ships
- Frontend publishable-key resolution in `PaymentSetup.tsx` — separate follow-up after the secret is set, since it needs the key to exist before it can be tested

### After this ships

1. Open Mark's customer page → flip **Sandbox Application** on
2. You give me the `STRIPE_TEST_PUBLISHABLE_KEY`
3. I wire up the publishable-key resolver in `PaymentSetup.tsx`
4. Mark hits payment setup → Stripe Elements loads in test mode → he uses test bank `110000000` / `000123456789`
5. End-to-end sandbox flow works without touching real money

