

## Show Axle Count & Body Material on Customer Pages

Three customer-facing pages display trailer details and need updating:

### 1. `src/pages/customer/Rentals.tsx`
- **Query**: Add `axle_count` and `body_material` to the `trailer:trailers(...)` select (line 88-97)
- **Interface**: Add `axle_count: number | null` and `body_material: string | null` to the trailer object in `SubscriptionItemData`
- **UI**: Add two lines below the existing year/make/model display showing axle count and body material when present

### 2. `src/pages/customer/LeaseToOwn.tsx`
- **Query**: Add `axle_count, body_material` to the `trailer:trailers(trailer_number, type, year, vin)` select (line 130)
- **Interface**: Update the `SubscriptionItem` trailer type to include the new fields
- **UI**: Display the fields wherever trailer specs are shown on this page

### 3. No changes needed for `CustomerDashboard.tsx`
The dashboard only fetches a trailer count, not details — no spec display to update.

### Notes
- No database or RLS changes needed — the `trailers` table already has a `Customers can view assigned trailers` SELECT policy that covers this
- The new columns are already in the table; we just need to include them in the select queries and render them

