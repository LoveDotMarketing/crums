

## Admin Billing Dashboard vs Stripe: Issues Found

### Problem Summary
The billing dashboard has a **status sync gap**: payments that Stripe shows as "Failed" or "Pending" are all stored as "processing" in the database. This means the dashboard doesn't accurately reflect which payments actually failed vs. which are still in-flight.

### Specific Discrepancies

| Customer | Amount | Stripe Status | DB Status | Issue |
|----------|--------|--------------|-----------|-------|
| porter686868 (Gerald) | $1,666 | **Failed** (requires_payment_method) | processing | Should show "failed" |
| doitmoving6 (Roderick) | $4,800 | **Failed** (requires_payment_method) | processing | Should show "failed" |
| porter686868 (Gerald) | $900 | **Failed** (requires_payment_method) | processing | Should show "failed" |
| Azptrucking | $1,400 | **Incomplete** (requires_payment_method) | processing | Should show "failed" |
| halona@royalduck | $15,480 | Pending (processing) | processing | OK — ACH in transit |
| bmslogistics | $419.56 | Pending (processing) | processing | OK — ACH in transit |
| dispatch@groundlink | $2,300 | Pending (processing) | processing | OK — ACH in transit |
| fjmtransport67 | $900 | Pending (processing) | processing | OK — ACH in transit |
| zitruckingteam | $175 | Pending (processing) | processing | OK — ACH in transit |

### Root Cause
The `process-billing` sync function only checks **invoice status** (`paid`/`open`/`uncollectible`) but doesn't check the underlying **payment intent status**. When an ACH payment fails, the invoice stays `open` in Stripe (not `uncollectible`), so the sync maps it to `pending`. But the billing_history records were inserted as `processing` during creation and never get updated to `failed` because the invoice is still `open`.

### Fix Plan

**File: `supabase/functions/process-billing/index.ts`**

Update the invoice sync logic to also check the payment intent status when the invoice is `open`:
- If the invoice is `open` AND the payment intent status is `requires_payment_method` → set billing_history status to `failed`
- If the invoice is `open` AND the payment intent status is `processing` → keep as `processing`
- If the invoice is `open` AND there's no payment intent → set as `pending`

```typescript
// Current logic (line ~131):
if (invoice.status === "paid") paymentStatus = "succeeded";
else if (invoice.status === "open") paymentStatus = "pending";

// New logic:
if (invoice.status === "paid") {
  paymentStatus = "succeeded";
} else if (invoice.status === "open") {
  // Check the payment intent to distinguish pending vs failed vs processing
  const piId = typeof invoice.payment_intent === 'string' 
    ? invoice.payment_intent : invoice.payment_intent?.id;
  if (piId) {
    const pi = await stripe.paymentIntents.retrieve(piId);
    if (pi.status === "requires_payment_method") paymentStatus = "failed";
    else if (pi.status === "processing") paymentStatus = "processing";
    else paymentStatus = "pending";
  } else {
    paymentStatus = "pending";
  }
}
```

**File: `supabase/functions/sync-payments/index.ts`**

Apply the same payment intent status check during the sync-payments flow so both sync paths produce consistent statuses.

**File: `supabase/functions/stripe-webhook/index.ts`**

Verify that `payment_intent.payment_failed` webhook events update `billing_history` status to `failed`. This ensures real-time updates without waiting for the next sync.

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/process-billing/index.ts` | Check payment intent status for open invoices to distinguish failed vs processing |
| `supabase/functions/sync-payments/index.ts` | Same payment intent status check for consistency |
| `supabase/functions/stripe-webhook/index.ts` | Verify failed payment events update billing_history |

