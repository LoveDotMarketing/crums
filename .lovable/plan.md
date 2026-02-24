

# Fix: Edge Function Rejects Customer's Already-Assigned Trailers

## Problem

The Create Subscription dialog now correctly shows Ground Link LLC's 8 trailers. However, when the admin submits, the `create-subscription` edge function will reject them because it checks `is_rented = true` and throws an error: *"Trailer(s) are already rented. Please select available trailers."*

Ground Link's trailers are already marked `is_rented: true` and `customer_id` is set -- they were physically assigned but never had a subscription created. The edge function needs to allow trailers that are already assigned to the **same customer** being subscribed.

## Root Cause

`supabase/functions/create-subscription/index.ts`, lines 125-136:

```text
Check: trailers WHERE id IN (trailerIds) AND is_rented = true
If any found -> throw error (blocks submission)
```

This check makes no distinction between trailers rented by *another* customer vs trailers already assigned to *this* customer.

## Fix

Update the rented-trailer check (lines 125-136) to **exclude trailers already assigned to the target customer**. The logic becomes:

- Fetch trailers that are `is_rented = true` AND in the requested list
- Filter out any that already have `customer_id = customerId` (the customer we're creating the subscription for)
- Only throw an error if there are trailers rented by a *different* customer

This is a single change in `supabase/functions/create-subscription/index.ts`. No frontend changes needed.

## Technical Details

| File | Change |
|---|---|
| `supabase/functions/create-subscription/index.ts` (lines 125-136) | After fetching rented trailers, filter out those where `customer_id` matches the target `customerId`. Only error if remaining trailers (rented by others) exist. |

The updated logic:

```text
1. Query trailers WHERE id IN (trailerIds) AND is_rented = true
2. Filter results: remove trailers where customer_id == customerId
3. If filtered list is non-empty -> error (trailers rented by someone else)
4. If filtered list is empty -> allow (trailers belong to this customer already)
```

After creating the subscription, the existing code at line 442-446 already sets `is_rented: true` and `customer_id`, so trailers that were already assigned won't be double-updated (idempotent).

