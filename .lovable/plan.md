

## Root Cause Analysis

The Stripe subscription for Abdul went straight to `active` with **zero invoices and zero charges**. Here's why:

1. `create-subscription` uses `payment_behavior: "default_incomplete"` + `billing_cycle_anchor` (April 1st) + `proration_behavior: "none"`
2. With no proration and a future anchor date, Stripe generates **no initial invoice** — there's nothing to charge now
3. The deposit was added via `add_invoice_items`, but that only attaches to the **next** invoice (April 1st), not an immediate one
4. Since there's no invoice, Stripe marks the subscription `active` immediately
5. When admin clicks "Activate", the function sees `status: active` and returns "already active, skipping payment" — deposit never charges

This is confirmed by Stripe data: `sub_1T7gfiLjIwiEGQIhGj7Zxb1v` is `active`, customer `cus_U5sQ2ohTsvdzXt` has 0 invoices, 0 payment intents, 0 charges.

## Fix

### 1. `create-subscription` edge function — charge deposit immediately as a standalone invoice

After creating the Stripe subscription, if the subscription went straight to `active` (no open invoice) and `depositAmount > 0`:
- Create a standalone invoice item on the customer for the deposit
- Create, finalize, and auto-charge a separate invoice immediately
- Update `deposit_paid` and `deposit_paid_at` in the database
- This ensures the deposit is collected on subscription creation day, independent of the billing anchor

### 2. `activate-subscription` edge function — handle deposit-only activation

When the subscription is already `active` but `deposit_paid = false` and `deposit_amount > 0`:
- Instead of returning "already active, skipping", create a standalone deposit invoice and charge it
- Update deposit status in the database on success
- This covers cases where the deposit wasn't charged during creation (e.g., existing subscriptions)

### Files to update
- `supabase/functions/create-subscription/index.ts` — add post-creation deposit invoice logic (~lines 411-420)
- `supabase/functions/activate-subscription/index.ts` — add deposit charging for already-active subscriptions (~lines 102-112)

No database changes needed.

