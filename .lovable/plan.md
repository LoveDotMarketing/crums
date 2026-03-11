

## Investigation Summary

Trailer 606945 is correctly assigned to Gerald Porter (`customer_id = d41cab5d-8ee2-4c8c-b19b-02250091f842`) in the database with status `rented`. The SQL query returns it correctly when Gerald Porter is selected.

The issue is in the trailer fetching logic in `CreateSubscriptionDialog.tsx`. The `.or()` PostgREST filter syntax works at the SQL level, but there may be a race condition: the `subscribedTrailerIds` query and the trailers query both depend on `selectedCustomerId` and fire simultaneously. If the `subscribedTrailerIds` resolves as `undefined` momentarily, the trailer query might run with stale cache from before the customer was selected.

## Plan

**File: `src/components/admin/CreateSubscriptionDialog.tsx`**

1. Add `selectedCustomerId` to the `enabled` condition for the trailers query so it only runs the customer-specific branch after a customer is selected, preventing stale empty-customer results from being served.

2. Ensure `subscribedTrailerIds` is fully resolved before the trailers query fires by adding it to the `enabled` guard (e.g., `enabled: (isOpen || mode === "inline") && !!selectedCustomerId && subscribedTrailerIds !== undefined`).

3. For a more robust approach, split the query into two explicit fetches when a customer is selected:
   - Fetch available trailers: `status = 'available' AND customer_id IS NULL`
   - Fetch customer-assigned trailers: `customer_id = selectedCustomerId`
   - Merge and deduplicate the results

   This avoids any PostgREST `.or()` syntax edge cases entirely.

## Technical Details

The current query uses PostgREST's `.or()` filter:
```
.or(`and(status.eq.available,customer_id.is.null),customer_id.eq.${selectedCustomerId}`)
```

The replacement will use two separate queries merged client-side, which is more reliable and easier to debug. The `subscribedTrailerIds` exclusion filter remains unchanged.

