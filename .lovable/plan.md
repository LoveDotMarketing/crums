

## What's Off

Looking at the Payment History screenshot and the database, there are **two problems**:

### Problem 1: Duplicate billing_history for Ground Link's $2,300
Two records reference the **same Stripe invoice** (`in_1T5zmQLjIwiEGQIh`):
- A "Processing" row — created by the Activate button
- A "Pending" row (with period Feb 26–Feb 28) — created by the daily `process-billing` cron

The cron didn't check whether a billing_history record already existed for that invoice before inserting a new one.

### Problem 2: Net amount shows $0.00
The `activate-subscription` function sets `net_amount: paidInvoice.amount_paid / 100`. Since ACH hasn't cleared yet at the time of initiation, Stripe reports `amount_paid = 0`. The net should default to the invoice amount and get corrected by `sync-payments` once the ACH clears.

---

### Fix Plan

**1. `activate-subscription` edge function** — Set `net_amount` to `amount_due / 100` instead of `amount_paid / 100` so it shows the expected charge amount while processing.

**2. `process-billing` edge function** — Add a check: before inserting a new `billing_history` record, query for an existing record with the same `stripe_invoice_id`. If one exists, skip the insert to prevent duplicates.

**3. Clean up the duplicate** — Delete the extra "Pending" billing_history row (`id: 30487e96...`) that duplicates the same Stripe invoice.

