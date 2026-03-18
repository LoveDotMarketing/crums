

## Add Delete Lead Functionality

### What Changes
Add a delete button to the lead detail dialog with a confirmation step to prevent accidental deletions.

### Steps

1. **Update `src/pages/admin/PhoneLeads.tsx`**:
   - Add a delete mutation that removes the lead from `phone_leads` table
   - Add a "Delete Lead" button (destructive variant) at the bottom of the detail dialog
   - Add an `AlertDialog` confirmation before deleting ("Are you sure? This cannot be undone.")
   - On successful delete, close the dialog and refresh the list

No database changes needed — admins already have full access to `phone_leads` via existing RLS policies (admin ALL policy).

### File Changed
- `src/pages/admin/PhoneLeads.tsx`

