

## Problem

Two invoices have settled (paid) in Stripe but the admin billing dashboard shows stale data:

| Invoice | Stripe Status | DB `billing_history` Status | Customer |
|---|---|---|---|
| `in_1T5zmQLjIwiEGQIhxNr7ou13` | **paid** ($2,300) | `processing` | Ground Link |
| `in_1T60BzLjIwiEGQIh8dhk2eJY` | **paid** ($900) | `pending` | Fisneur |

Additionally, all 4 subscriptions have `next_billing_date: null` and `deposit_paid: false`.

**Root cause**: Both edge functions have blind spots:
1. **`process-billing`** finds existing records by `stripe_invoice_id` but **skips them entirely** — it never updates their status when an invoice transitions from open → paid.
2. **`sync-payments`** looks up records by `stripe_payment_intent_id`, but the existing records were created by `process-billing` without a `stripe_payment_intent_id` (null). So it can't find them, and tries to create duplicates (which may silently fail or create orphan records).
3. The **Refresh Sync button** calls both functions, but neither one actually updates existing stale records — so nothing changes.

There's also a missing subscription: Stripe has `sub_1T6fduLjIwiEGQIhq7hxoreX` (Ground Link, active) that doesn't exist in the database at all.

## Fix

### 1. Fix `process-billing` to update existing billing records (~line 106-130)

When it finds an existing record by `stripe_invoice_id`, instead of skipping with `continue`, it should **update the status** if the Stripe invoice status has changed:

```typescript
if (existing) {
  // Update status if invoice status changed
  const { error: updateError } = await supabaseClient
    .from("billing_history")
    .update({
      status: paymentStatus,
      paid_at: paymentStatus === "succeeded" && invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : existing.paid_at,
      stripe_payment_intent_id: typeof invoice.payment_intent === 'string' 
        ? invoice.payment_intent : invoice.payment_intent?.id,
      net_amount: invoice.amount_paid / 100,
    })
    .eq("id", existing.id);
  continue;
}
```

### 2. Fix `sync-payments` to also match by `stripe_invoice_id` (~line 101-130)

When looking up existing payment records, fall back to `stripe_invoice_id` if `stripe_payment_intent_id` lookup returns nothing:

```typescript
// Try by payment_intent_id first, then by invoice_id
let existingPayment = null;
const { data: byPI } = await supabaseClient
  .from("billing_history")
  .select("id, status, paid_at")
  .eq("stripe_payment_intent_id", pi.id)
  .maybeSingle();

existingPayment = byPI;

if (!existingPayment && pi.invoice) {
  const { data: byInv } = await supabaseClient
    .from("billing_history")
    .select("id, status, paid_at")
    .eq("stripe_invoice_id", pi.invoice as string)
    .maybeSingle();
  existingPayment = byInv;
}
```

Also update the `stripe_payment_intent_id` on the record when it's found by invoice ID so future lookups work.

### 3. Fix stale data immediately

Run a data update to correct the two billing_history records and subscription next_billing_dates using the insert tool (UPDATE statements).

### 4. Fix `process-billing` existing record query

Change `select("id")` to `select("id, status, paid_at")` so we have the data needed for comparison.

### Files to update
- `supabase/functions/process-billing/index.ts` — update existing records instead of skipping (~15 lines changed)
- `supabase/functions/sync-payments/index.ts` — add invoice_id fallback lookup (~15 lines changed)
- **Data fix** — UPDATE billing_history statuses and subscription next_billing_dates

