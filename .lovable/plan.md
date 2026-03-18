

## Improve Phone Leads Page

### 1. Add Lead Detail Dialog
Click any row in the table to open a dialog showing all lead info: name, phone, email, status, full notes (not truncated), date created, and converted customer link if applicable.

- Add state for `selectedLead` in `PhoneLeads.tsx`
- Add `onClick` handler to each `TableRow` to set the selected lead
- Render a `Dialog` with all fields laid out clearly
- Keep the status `Select` dropdown in the table working as-is (stop propagation so clicking the dropdown doesn't open the dialog)

### 2. Auto-Convert Trigger — Already Handled
The existing `auto_convert_phone_lead` database trigger already fires on `INSERT` to the `customers` table and matches by **phone** or **email**. This covers the "same phone number" scenario. No changes needed here.

### Files Changed
- `src/pages/admin/PhoneLeads.tsx` — add Dialog import, selectedLead state, row click handler, and detail dialog

