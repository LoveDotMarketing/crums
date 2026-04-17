

## Plan: Fix Pause to Keep Trailers + Recover Royal Duck

### Problem (from Ambrosia)

1. **Pausing a subscription removes the trailers from inventory and ends the line items.** That's wrong — pause should *only* stop billing collection. Trailers must stay assigned to the customer and on the subscription so resume picks back up cleanly.
2. **Re-adding the trailers via "Add Trailers to Subscription" failed** with `Edge Function returned a non-2xx status code` for Royal Duck (because the trailers got orphaned by the bad pause behavior, and the add path tried to layer new $750 items on top of the 3 still-billing Stripe items — would have caused $4,500/mo double-charge anyway).

### Confirmed state for Royal Duck (sub `0f60a8ec…`, Stripe `sub_1TEIAW…`)

- Stripe: **active**, 3 line items totaling **$2,250/mo** (still billing correctly).
- DB: 3 `subscription_items` marked `ended`, trailers `156004 / 158434 / 166256` released to `available` with `customer_id=null`.
- DB ↔ Stripe are **out of sync**.

### Fix part A — Change pause behavior (code)

In `supabase/functions/manage-subscription/index.ts`:

- **Default `releaseTrailers` to `false`** for the `pause` action (only release on `cancel`).
- When `action === "pause"`: skip the block that ends `subscription_items` and clears trailer assignments. Leave items `active` and trailers `is_rented=true / status='rented' / customer_id=<owner>`.
- The Stripe call (`pause_collection: { behavior: "void" }`) already does the right thing — it stops invoices but keeps the subscription and items intact.
- On `resume`: stop trying to "reactivate" items that were never paused. Just clear `pause_collection` on Stripe and set local status back to `active`. (Keep the existing reactivation code only as a safety net for legacy paused items.)

Update the frontend confirm dialog copy in `src/pages/admin/Billing.tsx` so "Pause Subscription" no longer warns about releasing trailers.

### Fix part B — Recover Royal Duck (data only, no code)

Run a one-off migration to resync DB to match Stripe reality:

1. Set the 3 `subscription_items` (currently `ended`) back to `status='active'`, clear `end_date`, and re-link `stripe_subscription_item_id` to `si_UChZlbG2GFx5rq`, `si_UChZSrxDBCoaw9`, `si_UChZ9b1O00k0Cc` by matching trailer products (`156004`, `158434`, `166256`).
2. Re-assign trailers `156004 / 158434 / 166256` to Royal Duck: `is_rented=true, status='rented', customer_id='<royal-duck-customer-id>'`.
3. Log the recovery in `app_event_logs`.

Result: Royal Duck shows 3 trailers in their inventory again, no Stripe changes needed, billing continues normally on the next cycle.

### Files

1. `supabase/functions/manage-subscription/index.ts` — change pause to keep trailers.
2. `src/pages/admin/Billing.tsx` — update pause confirmation copy.
3. New migration — resync Royal Duck's `subscription_items` and `trailers` rows.

No Stripe API changes for Royal Duck; their Stripe sub is already in the correct state.

