

## Problem

Ground Link shows "Pending" in the UI but Stripe shows "Incomplete". This happens because `activate-subscription` set the local status to "active" and created a `billing_history` record with "processing" status, but the Stripe subscription never transitioned out of "incomplete" (payment didn't initiate successfully). The `processingLabel` logic sees the billing_history record and shows "Pending" instead of "Incomplete".

After a sync, `sync-payments` would update Ground Link's `sub.status` from "active" back to "pending" (Stripe "incomplete" maps to "pending"), but the UI would then show "Activate" again instead of "Incomplete".

## Fix (2 changes)

### 1. Update `processingLabel` to detect failed activations (`src/pages/admin/Billing.tsx`, ~lines 1316-1347)

Add logic to detect when a subscription was previously activated but Stripe still shows incomplete:

- If `sub.status === "pending"` AND has `stripe_subscription_id` AND billing_history records exist (activation was attempted) → show "Incomplete" button instead of "Activate"
- If `sub.status === "active"` AND billing_history has processing/pending records → continue showing "Pending" or "Processing"

```typescript
// Check if activation was previously attempted (billing_history exists)
const hasAttemptedActivation = billingHistory?.some(
  bh => bh.subscription_id === sub.id
);

// Detect incomplete: pending status with prior activation attempt
const isIncomplete = (sub.status === "pending" && sub.stripe_subscription_id && hasAttemptedActivation) ||
  (sub.status === "active" && sub.stripe_subscription_id && 
   !hasSuccessfulPayment && !hasProcessingPayment);

const isProcessing = activatedIds.has(sub.id) || 
  (sub.status === "active" && hasProcessingPayment && !hasSuccessfulPayment) ||
  isIncomplete;

const processingLabel = latestPaymentRecord?.status === "pending" && sub.status === "active" ? "Pending"
  : latestPaymentRecord?.status === "processing" && sub.status === "active" ? "Processing"
  : activatedIds.has(sub.id) ? "Processing"
  : isIncomplete ? "Incomplete"
  : "Processing";
```

This ensures:
- **Jean** (sub.status = "active", billing_history = "pending") → shows **"Pending"**
- **Ground Link** after sync (sub.status = "pending", has billing_history) → shows **"Incomplete"**
- **Ground Link** before sync (sub.status = "active", no processing billing_history if sync updated it to failed) → shows **"Incomplete"**

### 2. Exclude incomplete subscriptions from `isReadyToActivate`

Update `isReadyToActivate` to not show "Activate" for previously-attempted subscriptions that are incomplete — those should show the "Incomplete" indicator instead:

```typescript
const isReadyToActivate = !isProcessing && sub.stripe_subscription_id && 
  sub.stripe_customer_id && !hasAttemptedActivation && (
    sub.status === "pending" || 
    (sub.status === "active" && !hasSuccessfulPayment)
  );
```

### Files to change
- **`src/pages/admin/Billing.tsx`** — Detect failed activations and show "Incomplete" label

