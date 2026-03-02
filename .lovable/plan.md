

## Plan

Show a "Processing" button instead of "Activate" for subscriptions that have been activated but are awaiting ACH settlement, and sync the status when Stripe confirms payment.

### 1. Track activated IDs as "processing" instead of hiding them

In `src/pages/admin/Billing.tsx`, instead of just hiding the button when `activatedIds` contains the subscription ID, show a disabled "Processing" badge/button with a spinner icon.

**Change the button rendering logic (lines 1430-1446):**
- If `activatedIds.has(sub.id)` — show a disabled button with "Processing" text and a spinner
- If `isReadyToActivate` and not in `activatedIds` — show the current "Activate" button
- Otherwise — show nothing

### 2. Also show "Processing" for subscriptions that are `active` locally but have only `processing` billing history

Update the logic to detect subscriptions where `sub.status === "active"` and billing history exists but all entries are in `processing` status (not yet `succeeded`). These should also show the "Processing" button. This covers page refreshes where the local `activatedIds` state is lost.

**Add a check around line 1312:**
```typescript
const hasProcessingPayment = billingHistory?.some(
  bh => bh.subscription_id === sub.id && bh.status === "processing"
);
const isProcessing = activatedIds.has(sub.id) || 
  (sub.status === "active" && hasProcessingPayment && !hasSuccessfulPayment);
```

### 3. Stripe webhook already handles status sync

The existing `stripe-webhook` edge function and `sync-payments` cron job already update billing history status when Stripe confirms ACH settlement. No backend changes needed — the "Processing" indicator will naturally disappear once `hasSuccessfulPayment` becomes true after the webhook updates the record.

### Files to change
- **`src/pages/admin/Billing.tsx`** — Add processing state detection and "Processing" button UI

