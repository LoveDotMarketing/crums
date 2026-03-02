

## Plan: Show all assigned trailers on customer profile

The customer detail page currently only shows trailers linked via `subscription_items`. Ground Link has 8 trailers assigned in the `trailers` table but only 3 have `subscription_items` records. The fix adds a direct query on the `trailers` table to show all assigned trailers.

### Changes to `src/pages/admin/CustomerDetail.tsx`

1. **Add a new query** for trailers assigned directly via `trailers.customer_id = customerId`
2. **Update the trailer count card** (line ~349) to show the total of directly-assigned trailers instead of just subscription items
3. **Add an "All Assigned Trailers" section** in the Overview tab that lists every trailer where `customer_id` matches, showing trailer number, type, VIN, and status — independent of subscription items
4. The existing per-subscription trailer tables remain unchanged (they show which trailers are on which subscription)

This ensures all 8 trailers appear on Ground Link's profile without requiring database changes.

