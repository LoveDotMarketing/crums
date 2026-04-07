

## Fix: Show Assigned Trailers in Manage Trailers Dialog

### Problem
Trailer 034038 is already assigned to James E. Guthrie (`customer_id` set on the trailer), but the **Manage Trailers** dialog (used to add equipment to an existing subscription) only shows trailers with `is_rented: false` and status `available/pending`. Since 034038 is already assigned, it doesn't appear in the list.

The **Create Subscription** dialog already handles this correctly with a dual-query pattern, but the **Manage Trailers** dialog does not.

### Solution
Apply the same dual-query pattern from `CreateSubscriptionDialog` to `ManageTrailersDialog`: fetch both available trailers AND trailers assigned to the subscription's customer, then merge and deduplicate (excluding trailers already on the subscription).

### Technical Change
**File: `src/components/admin/ManageTrailersDialog.tsx` (lines 82-97)**

Update the `available-trailers-for-subscription` query to:
1. Accept `customerId` as a query key dependency
2. Run two parallel queries: one for generally available trailers, one for trailers assigned to this customer
3. Merge results, excluding trailers already on the current subscription (from `currentItems`)

This mirrors the existing pattern in `CreateSubscriptionDialog.tsx` lines 186-214.

