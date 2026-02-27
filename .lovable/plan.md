

# Fix: Subscribe Legacy-Assigned Trailers Without Releasing Them

## Problem Diagnosis

The `create-subscription` edge function and the `CreateSubscriptionDialog` already support subscribing trailers that are assigned to the same customer. The trailer picker query (line 158 of `CreateSubscriptionDialog.tsx`) shows trailers where `customer_id` matches the selected customer:

```
or(`and(status.eq.available,customer_id.is.null),customer_id.eq.${selectedCustomerId}`)
```

And the edge function (lines 132-138) explicitly allows `is_rented: true` trailers if `customer_id` matches.

**The most likely cause is that the legacy-migrated trailers have `assigned_to` set but NOT `customer_id`.** The `assigned_to` column holds a user UUID, while `customer_id` holds the customer table UUID. If the 26 trailers only have `assigned_to` populated, they won't appear in the subscription dialog for that customer.

## Recommended Fix

Rather than releasing and re-assigning 26 trailers, update the trailer picker query to also include trailers where `assigned_to` matches the customer's auth user ID. This requires one change:

### 1. Update `CreateSubscriptionDialog.tsx` trailer query

Modify the `availableTrailers` query to also match trailers by `assigned_to` (the auth user UUID linked to the customer). When a customer is selected, look up their profile to get the auth `user_id`, then include trailers where either `customer_id` or `assigned_to` matches.

**Alternative (simpler, one-time):** If these 26 trailers simply need their `customer_id` column populated to match the customers table, a single SQL UPDATE can backfill `customer_id` from the `assigned_to` relationship. This avoids any code changes and makes the existing flow work immediately for all 26 trailers.

### Recommended approach: One-time data backfill

Run a migration that sets `customer_id` on trailers where `assigned_to` is set but `customer_id` is null, by joining through profiles and customers tables:

```sql
UPDATE trailers t
SET customer_id = c.id
FROM profiles p
JOIN customers c ON lower(c.email) = lower(p.email)
WHERE t.assigned_to = p.id
  AND t.customer_id IS NULL
  AND t.is_rented = true;
```

This links the 26 legacy trailers to their correct customer records without releasing or re-assigning anything. After this, the Create Subscription dialog will show them when Ground Link (or any legacy customer) is selected.

### Changes Summary

| Step | What | Why |
|---|---|---|
| 1 | Run SQL backfill to populate `customer_id` from `assigned_to` | Makes legacy trailers visible in the subscription dialog |
| 2 | Verify in the Create Subscription dialog that Ground Link's 26 trailers appear | Confirm the fix works |

No code changes needed -- just a one-time data migration.

