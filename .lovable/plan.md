

## Plan

Show the real Stripe payment status on the "Processing" button instead of a generic label, so admins can distinguish between "Pending" (Jean — ACH initiated) and "Incomplete" (Ground Link — payment not yet attempted).

### 1. Determine the display label from billing_history status

In `src/pages/admin/Billing.tsx`, when `isProcessing` is true, find the most recent billing_history record for that subscription and use its status as the button label.

For subscriptions with no billing_history record but still in `activatedIds` (just activated this session), fall back to "Processing".

For subscriptions where `sub.status === "active"` but Stripe shows incomplete (no billing_history record and not in `activatedIds`), show the raw local subscription status or "Incomplete".

**Change around lines 1316-1323:**
```typescript
// Get the most recent billing_history entry for this subscription
const latestPaymentRecord = billingHistory
  ?.filter(bh => bh.subscription_id === sub.id)
  ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())?.[0];

const hasProcessingPayment = latestPaymentRecord && 
  (latestPaymentRecord.status === "processing" || latestPaymentRecord.status === "pending");

const isProcessing = activatedIds.has(sub.id) || 
  (sub.status === "active" && hasProcessingPayment && !hasSuccessfulPayment);

// Determine the Stripe-aligned label
const processingLabel = latestPaymentRecord?.status === "pending" ? "Pending"
  : latestPaymentRecord?.status === "processing" ? "Processing"
  : activatedIds.has(sub.id) ? "Processing"
  : (sub.status === "active" && !hasSuccessfulPayment && !hasProcessingPayment) ? "Incomplete"
  : "Processing";
```

### 2. Also detect "Incomplete" state (no billing_history, active locally but never charged)

Expand `isProcessing` to also cover the case where subscription is active locally but has no billing history at all (Ground Link's case — Stripe shows "incomplete"). This means:
- `sub.status === "active"` AND no successful payment AND no processing/pending payment AND has a `stripe_subscription_id`

Update `isProcessing` and `isReadyToActivate` accordingly, and show "Incomplete" as the label for these.

### 3. Update button text (lines 1438-1447)

Replace the hardcoded "Processing" text with the dynamic `processingLabel`:
```tsx
<RefreshCw className="h-3 w-3 animate-spin mr-1" />
{processingLabel}
```

### Files to change
- **`src/pages/admin/Billing.tsx`** — Dynamic status label based on billing_history status, detect incomplete state

