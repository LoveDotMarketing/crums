
## Add Lease Agreement Type to Trailer Detail Page

### What Changes

Replace the "Rental Rate" field in the Lessee Assignment card with a "Lease Agreement" type selector, and keep the rate/frequency fields.

### Layout (Lessee Assignment card)

The card will show 3 fields in the grid:

1. **Assigned Customer** (existing, no change)
2. **Agreement Type** (new) -- Select dropdown with options: "Standard Lease", "Lease to Own", "Rent for Storage", "Repayment Plan"
3. **Rate** (existing rental rate + frequency, kept as-is)

### Technical Details

**File: `src/pages/admin/TrailerDetail.tsx`**

- Add a query to fetch the `subscription_type` from `customer_subscriptions` for the trailer's assigned customer (using `customer_id`).
- Also fetch the `lease_to_own` flag from `subscription_items` for this specific trailer.
- In the Lessee Assignment card (lines 468-549):
  - Change the grid from `grid-cols-2` to allow 3 fields (or stack Agreement Type below Assigned Customer).
  - Replace the "Rental Rate" label area with an "Agreement Type" field that displays a badge (read mode) or a Select dropdown (edit mode) with options: Standard Lease, Lease to Own, Rent for Storage, Repayment Plan.
  - Keep the Rental Rate field below or beside it.
- On save, update the `subscription_type` on the `customer_subscriptions` record and/or the `lease_to_own` flag on `subscription_items` for this trailer.
- Update the `Trailer` interface if needed (though agreement type lives on subscription tables, not the trailer itself).

### No Database Changes Required

The `customer_subscriptions.subscription_type` enum and `subscription_items.lease_to_own` boolean already exist.
