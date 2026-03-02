

## Problem

The "Processing" button never appears because the billing history status for Jean's record is stored as **`"pending"`** in the database, but the code checks for `bh.status === "processing"`. This mismatch means `hasProcessingPayment` is always `false`, so `isProcessing` never triggers.

## Fix

In `src/pages/admin/Billing.tsx`, update the `hasProcessingPayment` check (line 1317-1318) to also match `"pending"` status:

```typescript
const hasProcessingPayment = billingHistory?.some(
  bh => bh.subscription_id === sub.id && (bh.status === "processing" || bh.status === "pending")
);
```

This single change will make the Processing button appear for Jean's subscription (and any future ACH payments that start with `pending` status).

### Files to change
- **`src/pages/admin/Billing.tsx`** — Include `"pending"` in the processing payment check

