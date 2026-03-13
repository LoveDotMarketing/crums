

## Analysis: "Activate" Buttons vs Stripe Reality

### The Problem

The "Activate" button appears whenever a subscription has **no `succeeded` record in `billing_history`**. But `billing_history` is severely incomplete — only 3 records exist for 8 subscriptions. The sync jobs haven't backfilled the data.

### Subscription-by-Subscription Comparison

| Customer | DB Status | Stripe Sub | Stripe PI Status | billing_history | Activate Correct? |
|----------|-----------|------------|-----------------|-----------------|-------------------|
| **Porter** | active | active | $900 processing | none | NO — should show "Processing" |
| **Nabizada** | active | active | $175 processing | none | NO — should show "Processing" |
| **McGill** | active | active | $800 succeeded | 1 rec (processing) | NO — Stripe succeeded, local stale |
| **Ground Link** (3 subs) | active | active | $2300 succeeded | only 1 of 3 has succeeded | PARTIALLY — 2 subs missing records |
| **Patan** | active | active | no PIs at all, no invoices | none | YES — genuinely never charged |
| **Jean** | active | active | $900 succeeded | 1 rec (succeeded) | N/A — no Activate shown ✓ |

### Root Causes

1. **`sync-payments` hasn't run** (or ran before these payments existed), so `billing_history` is missing records for 5 of 8 subscriptions
2. **McGill's record is stale** — Stripe shows `succeeded` but local record still says `processing`
3. **`next_billing_date` is NULL for all 8** subscriptions — sync never populated it
4. **Patan has zero Stripe payment activity** — the subscription is active in Stripe but was never invoiced (likely $0 first invoice or the invoice is open)

### Fix Plan

**Step 1: Run sync-payments** to backfill all missing `billing_history` records and update `next_billing_date`. This will be done by invoking the edge function directly.

**Step 2: Fix the Activate logic** (code change in `src/pages/admin/Billing.tsx`)

The current logic only checks local `billing_history` to decide if a subscription needs activation. It should also account for the case where there's simply no billing history yet (data lag) by checking `deposit_paid` status more carefully. Specifically:

- If `status === "active"` AND the subscription has been active for more than a few minutes AND there's no billing_history at all, treat it as a sync gap rather than showing Activate
- Add a "Sync" action to the row menu so admins can trigger sync for individual subscriptions

**Step 3: Add a "Sync Payments" button** to the billing dashboard header so admins can manually trigger `sync-payments` when they notice stale data, rather than waiting for the daily cron.

### Files to Modify

1. **`src/pages/admin/Billing.tsx`** — Refine `isReadyToActivate` logic; add Sync button to header and per-row menu
2. **Run `sync-payments`** via edge function invocation to fix current data

