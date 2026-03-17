

## Add "Remove from Queue" to Ready to Activate Card

The "Ready to Activate" card currently only has an "Edit" button per row. Customers who completed ACH but won't sign a contract need to be removable from this queue.

### Approach

The queue is populated by filtering `customer_applications` where `payment_setup_status = 'completed'` and `status = 'approved'`. To remove a customer from this queue, we reset their application status back to a non-active state — specifically setting `status` to `'rejected'` (or a new `'withdrawn'` value) and optionally clearing the ACH status.

Since these customers explicitly decided not to proceed, the cleanest approach is:
- Set `customer_applications.status` to `'rejected'` with an `admin_notes` update indicating withdrawal
- This removes them from the "Ready to Activate" query without deleting any data

### Changes

**File: `src/components/admin/ReadyToActivateCard.tsx`**

1. Add a delete/remove button next to the existing "Edit" button in each row
2. Add confirmation dialog (AlertDialog) before removing — "Are you sure? This will mark the application as rejected."
3. On confirm: update `customer_applications` setting `status = 'rejected'` and `admin_notes` appended with withdrawal note
4. Invalidate the `ready-to-activate` query to refresh the list
5. Show toast confirmation

### Technical details
- Import `Trash2` icon, `AlertDialog` components, `useQueryClient`, and `toast`
- Add state for `customerToDelete` and `deleteDialogOpen`
- The update query: `supabase.from("customer_applications").update({ status: "rejected", admin_notes: "Removed from activation queue by admin" }).eq("id", customer.id)`
- No database migration needed — uses existing `status` column values

