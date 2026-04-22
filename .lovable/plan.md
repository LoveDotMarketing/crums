

## Plan: Sandbox Mode card on subscription detail

Add an admin-only "Sandbox Mode" card on the existing `EditSubscriptionPanel` so staff can flip a single subscription into Stripe test mode in one click — including auto-creating the test-mode Stripe customer.

### What gets built

**1. New edge function `enable-sandbox`** (admin JWT-protected)

Input: `{ subscriptionId }`.

Steps:
1. Verify caller has `admin` role (service-role client + `has_role`).
2. Load the subscription + linked customer (`full_name`, `email`).
3. If `sandbox_stripe_customer_id` already exists → reuse it (don't create duplicates on re-enable).
4. Otherwise, using the **test** Stripe client (`STRIPE_TEST_SECRET_KEY` via existing `_shared/billing.ts` helper exposure), create a new test-mode customer with the live customer's name + email, plus metadata `{ source: "lovable_admin_sandbox", live_customer_id, subscription_id }`.
5. Update `customer_subscriptions`: `sandbox = true`, `sandbox_stripe_customer_id = <cus_…>`.
6. Insert an `app_event_logs` row (category `billing`, type `sandbox_enabled`) for audit.
7. Return `{ sandbox_stripe_customer_id }`.

Errors: clear messages if `STRIPE_TEST_SECRET_KEY` missing, customer not found, or non-admin.

**2. New "Sandbox Mode" card on `EditSubscriptionPanel.tsx`**

Placed right after the existing "Payment Method" card (same row).

```text
┌─ Sandbox Mode ─────────────────────────┐
│ Status: [● Live]                       │
│                                        │
│ [○━━━━] Use Stripe test mode           │
│                                        │
│ — when sandbox = true: —               │
│ Test customer: cus_…  [copy]           │
│ ↗ Open in Stripe test dashboard        │
│                                        │
│ ℹ Use test card 4242 4242 4242 4242    │
│   to add a payment method.             │
└────────────────────────────────────────┘
```

- **Status badge**: green "Live" or amber "Sandbox" based on `subscription.sandbox`.
- **Toggle behavior**:
  - **Off → On**: opens an `AlertDialog` with the exact copy from the request:
    > "Enable sandbox mode for this subscription?
    > • All future charges use Stripe test mode — no real money moves.
    > • You'll need to attach a test payment method before charges will succeed.
    > • Existing live charge history is preserved and not affected."
    Confirm calls `enable-sandbox`. On success: optimistic update, toast, invalidate `subscription-detail` query.
  - **On → Off**: simple confirm dialog ("Switch back to live mode? The test customer is preserved for future re-enable."). Confirm does a direct `update({ sandbox: false })` — keeps `sandbox_stripe_customer_id` populated.
- **Sandbox details (only when sandbox = true)**:
  - Test customer ID with copy-to-clipboard button.
  - Link: `https://dashboard.stripe.com/test/customers/{cus_id}` (target `_blank`).
  - Yellow info note about test card `4242 4242 4242 4242`.

**3. Visibility / safety**
- Card always renders inside `EditSubscriptionPanel`, which is already only mounted in admin routes (`/dashboard/admin/billing`) — no extra role check needed in the component.
- The toggle is independent of the existing "Save Changes" button: enabling/disabling sandbox writes immediately so admins can't get into a half-saved state.
- Disable the toggle while the edge function is in flight (spinner on the switch).

### Files
1. `supabase/functions/enable-sandbox/index.ts` — new edge function (admin-verified, creates test-mode Stripe customer, updates subscription).
2. `src/components/admin/EditSubscriptionPanel.tsx` — new "Sandbox Mode" card + AlertDialog confirmations + handlers.

### Out of scope
- No automatic copying of payment methods between live and test customers (Stripe doesn't allow it; admin uses the 4242 card in test mode).
- No deletion of the test-mode Stripe customer when disabling — kept for re-enable.
- No bulk/global sandbox toggle — strictly per-subscription, matches the existing schema.
- No UI in the customer-facing portal — admin-only by virtue of the panel's location.

