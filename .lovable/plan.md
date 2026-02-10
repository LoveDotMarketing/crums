
## Add Lease Agreement Type to Customer Profile

### What Changes
Two additions to the admin customer profile dialog:

1. **Customer-level lease type label** -- Show the `subscription_type` from `customer_subscriptions` (e.g., "Standard Lease", "Lease to Own", "Rent for Storage", "Repayment Plan") as a badge near the top of the profile or in the Payment Type area.

2. **Per-trailer lease type badge** -- Under each assigned trailer in the "Assigned Trailers" section, show whether that specific trailer is "Lease to Own" or "Standard Rental" using the `lease_to_own` boolean from `subscription_items`.

### Technical Details

**File: `src/components/admin/CustomerFormDialog.tsx`**

- **New query**: Fetch the customer's `customer_subscriptions` record to get `subscription_type`.
- **Update trailer query**: Instead of querying `trailers` directly, query `subscription_items` joined with `trailers` to get both trailer info and the `lease_to_own` flag per trailer.
- **Update `TrailerInfo` interface**: Add `lease_to_own: boolean | null` field.
- **UI -- Subscription type badge**: Add a badge/label after the "Payment Type" field showing the subscription type (formatted nicely, e.g., "Lease to Own" instead of "lease_to_own").
- **UI -- Per-trailer badge**: Next to each trailer's type badge (e.g., "Dry Van"), add a second badge showing "Lease to Own" or "Standard Lease" based on the `lease_to_own` field.

### No Database Changes Required
All the data already exists:
- `customer_subscriptions.subscription_type` enum: `standard_lease`, `rent_for_storage`, `lease_to_own`, `repayment_plan`
- `subscription_items.lease_to_own` boolean per trailer
