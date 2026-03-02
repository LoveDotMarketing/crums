

## Problem

After activating Ground Link's subscription, the edge function sets the local status to "active" and pays the Stripe invoice. But:

1. In Stripe, the subscription status remains **"incomplete"** (not "pending") because ACH hasn't cleared yet
2. No `billing_history` record is created at activation time -- that only happens when the `sync-payments` cron runs daily at 7am UTC
3. After a page refresh, the in-memory `activatedIds` set is lost, so the "Processing" button disappears and "Activate" reappears (because: active status + no billing history = `isReadyToActivate`)

## Fix: Create billing_history record at activation time

In `supabase/functions/activate-subscription/index.ts`, after successfully calling `stripe.invoices.pay()`, insert a `billing_history` record with status `"processing"`. This persists the processing state in the database so it survives page refreshes and the UI correctly shows "Processing" without relying on the cron job.

```typescript
// After stripe.invoices.pay() succeeds:
await supabaseClient.from("billing_history").insert({
  subscription_id: subscriptionId,
  amount: paidInvoice.amount_due / 100,
  net_amount: paidInvoice.amount_paid / 100,
  status: "processing",
  stripe_payment_intent_id: paidInvoice.payment_intent,
  stripe_invoice_id: paidInvoice.id,
  payment_method: "ach",
});
```

The existing `sync-payments` cron will later update this record's status to `"succeeded"` once the ACH clears, which will automatically remove the "Processing" indicator since `hasSuccessfulPayment` will become true.

### Files to change
- **`supabase/functions/activate-subscription/index.ts`** -- Insert a `billing_history` record with `"processing"` status after invoice payment

