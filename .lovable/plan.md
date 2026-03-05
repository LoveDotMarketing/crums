

## Problem

The "Activate" button appears on subscriptions that already have payments processing in Stripe. Two issues:

1. **`pending` subscriptions always show "Activate"** (line 1392) — even if a deposit payment is already in-flight. The condition doesn't check for existing processing/pending billing_history records.

2. **`active` subscriptions with no `succeeded` payment show "Activate"** (line 1393) — but the `isProcessing` guard (line 1378) should prevent this IF a billing_history record exists. If the activate function ran but the billing_history insert failed or wasn't created, the guard fails.

Both Ground Link subscriptions and potentially others are affected.

## Fix

### 1. Update `isReadyToActivate` logic in `src/pages/admin/Billing.tsx` (~lines 1387-1394)

Add a check: if the subscription already has a `processing` or `pending` billing_history record, it should NOT show "Activate" — regardless of status. The existing `isProcessing` variable already captures this for `active` subs, but `pending` subs bypass it entirely.

Change:
```typescript
const isReadyToActivate = !isProcessing && sub.stripe_subscription_id && 
  sub.stripe_customer_id && (
    sub.status === "pending" || 
    (sub.status === "active" && !hasSuccessfulPayment)
  );
```

To:
```typescript
const isReadyToActivate = !isProcessing && sub.stripe_subscription_id && 
  sub.stripe_customer_id && !hasProcessingPayment && (
    sub.status === "pending" || 
    (sub.status === "active" && !hasSuccessfulPayment)
  );
```

Adding `!hasProcessingPayment` ensures that if a payment is already pending/processing for ANY subscription status, the Activate button is hidden and the Processing/Pending label shows instead.

### 2. Update `isProcessing` to also cover `pending` status subs with in-flight payments (~line 1378)

Change:
```typescript
const isProcessing = activatedIds.has(sub.id) || 
  (sub.status === "active" && hasProcessingPayment && !hasSuccessfulPayment);
```

To:
```typescript
const isProcessing = activatedIds.has(sub.id) || 
  (hasProcessingPayment && !hasSuccessfulPayment);
```

This removes the `sub.status === "active"` gate so that `pending` subs with processing payments also show the processing label instead of the Activate button.

### Files to update
- `src/pages/admin/Billing.tsx` — two small condition changes (~4 lines total)

No backend or database changes needed.

