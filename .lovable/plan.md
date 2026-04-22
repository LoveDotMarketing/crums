

## Plan: Per-subscription Stripe sandbox mode

Add a `sandbox` flag on each subscription so admins can route specific subscriptions through a Stripe **test** account (separate secret key, separate customer ID) without changing any business logic. Every billing record gets stamped with the mode it was processed in, and the webhook handles both live and test signatures.

### 1. Schema changes (one migration)

**`customer_subscriptions`**
- `sandbox boolean NOT NULL DEFAULT false`
- `sandbox_stripe_customer_id text NULL`
- Partial index: `CREATE INDEX idx_customer_subscriptions_sandbox ON customer_subscriptions(sandbox) WHERE sandbox = true;`

**`billing_history`**
- `stripe_mode text NOT NULL DEFAULT 'live'`
- `CHECK (stripe_mode IN ('live','test'))`

No data migration needed — existing rows stay `sandbox=false` / `stripe_mode='live'`.

### 2. New secret
- **`STRIPE_TEST_SECRET_KEY`** — Stripe test-mode secret key. After plan approval you'll be prompted to add it. Without it, any attempt to use a sandbox subscription throws a clear error.
- **`STRIPE_WEBHOOK_SIGNING_SECRET_TEST`** — webhook signing secret from the test endpoint. Naming mirrors the existing `STRIPE_WEBHOOK_SIGNING_SECRET`. Optional: if absent, webhook stays live-only and logs a warning when test signatures arrive.
- README gets a "Stripe Sandbox Mode" section documenting both secrets, how to flip a subscription to sandbox, and the workflow (create test customer in test mode → paste its `cus_…` into `sandbox_stripe_customer_id` → flip `sandbox=true`).

### 3. `_shared/billing.ts` — new helper

```ts
type SubLike = {
  sandbox?: boolean | null;
  stripe_customer_id?: string | null;
  sandbox_stripe_customer_id?: string | null;
};

export function getStripeClient(subscription: SubLike): {
  stripe: Stripe;
  mode: "live" | "test";
  customerId: string | null;
}
```

Rules:
- `sandbox=true` + `STRIPE_TEST_SECRET_KEY` set + `sandbox_stripe_customer_id` present → test client, `mode='test'`, `customerId=sandbox_stripe_customer_id`.
- `sandbox=true` but `STRIPE_TEST_SECRET_KEY` missing → throw `"STRIPE_TEST_SECRET_KEY is not configured. Set it before flipping a subscription to sandbox."`
- `sandbox=true` but `sandbox_stripe_customer_id` is null → throw `"Subscription is in sandbox mode but has no sandbox_stripe_customer_id. Create a test-mode customer in Stripe and set this field."`
- Otherwise → live client, `mode='live'`, `customerId=stripe_customer_id`.

Helper caches the two Stripe clients per cold-start.

### 4. Edge functions updated to use the helper

Every place that today does `new Stripe(STRIPE_SECRET_KEY, …)` and acts on a known subscription will:
1. Add `sandbox, sandbox_stripe_customer_id` to the subscription select.
2. Call `getStripeClient(subscription)` → use returned `stripe` + `customerId`.
3. Stamp `stripe_mode: mode` on every `billing_history` insert/upsert.

Functions touched:
- `process-billing` — main scheduled biller. Inserts billing_history.
- `create-subscription` — at creation, sandbox is always `false` (a brand-new sub is live by default; admins flip it later via the Billing dashboard if needed). Still adds `stripe_mode: 'live'` to its deposit billing_history row. Helper used so the path is consistent.
- `manage-subscription` — pause/resume/cancel uses helper.
- `process-payment-failures` — retries use helper, billing_history updates carry the existing row's mode (read it back, don't downgrade).
- `charge-toll`, `charge-customer`, `retry-payment`, `void-charge`, `sync-payments`, `modify-subscription`, `activate-subscription` — all use helper + stamp `stripe_mode`.
- `check-payment-status`, `confirm-ach-setup`, `create-ach-setup`, `reset-payment-setup`, `send-ach-setup-email` — these run on `customer_applications` *before* a subscription exists. **Out of scope for this change** — they stay on `STRIPE_SECRET_KEY` (live). Sandbox is a per-subscription concept; ACH onboarding always happens in live mode and the admin manually creates the matching test-mode customer when flipping a sub to sandbox. This is documented in the README.

### 5. `stripe-webhook` — dual-signature verification

Reuse existing `STRIPE_WEBHOOK_SIGNING_SECRET` for live; add new `STRIPE_WEBHOOK_SIGNING_SECRET_TEST`.

```
let event, mode;
try {
  event = await stripeLive.webhooks.constructEventAsync(body, sig, LIVE_SECRET);
  mode = "live";
} catch {
  if (TEST_SECRET) {
    event = await stripeTest.webhooks.constructEventAsync(body, sig, TEST_SECRET);
    mode = "test";
  } else throw;
}
```

Downstream handlers receive `(supabase, stripe, event, mode)` where `stripe` is the matching client. After looking up the subscription record, sanity-check `subscription.sandbox === (mode === 'test')` and log a warning on mismatch (don't fail — admin may be mid-flip). All `billing_history` writes from the webhook stamp `stripe_mode: mode`.

### 6. UI surface (minimal)
On the admin **Edit Subscription** panel, add a small "Sandbox mode" section:
- Toggle: **Sandbox (test Stripe account)**.
- Text input: **Sandbox Stripe customer ID** (`cus_…`), only shown when toggle is on.
- Inline help: *"When on, all billing for this subscription routes through your Stripe test account. Create the customer in Stripe test mode first and paste its ID here."*
- Save button refuses to enable sandbox without the customer ID (mirrors the edge-function guard).

### Files
1. New migration — schema additions + index + check constraint.
2. `supabase/functions/_shared/billing.ts` — add `getStripeClient`.
3. Edge functions listed in §4 — replace direct `new Stripe(...)` and stamp `stripe_mode`.
4. `supabase/functions/stripe-webhook/index.ts` — dual-secret verification + mode propagation.
5. `src/components/admin/EditSubscriptionPanel.tsx` — sandbox toggle + customer-ID field.
6. `src/integrations/supabase/types.ts` — auto-regenerated.
7. `README.md` — "Stripe Sandbox Mode" section.

### Out of scope
- ACH onboarding functions stay on live Stripe (documented).
- No automatic creation of the test-mode Stripe customer — admin does it manually in Stripe dashboard.
- Refunds, disputes, and Stripe Connect flows are unaffected (none currently in the codebase).
- No change to `subscription.stripe_subscription_id` semantics; for sandbox subs it will hold the test-mode `sub_…` ID once the next billing cycle creates it.

