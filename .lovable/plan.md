

# Change Customer Row Click to Navigate to Detail Page

## Problem
Clicking a customer row on the Customers list page opens the "Edit Customer" dialog instead of navigating to the detail page. The user wants direct navigation on click.

## Changes

### File: `src/pages/admin/Customers.tsx`

1. **Line 903**: Change the `onClick` handler on `<TableRow>` from opening the dialog to navigating to the customer detail page:
   - Replace: `onClick={() => { setSelectedCustomer(customer); setDialogOpen(true); }}`
   - With: `onClick={() => navigate(`/dashboard/admin/customers/${customer.id}`)}`

2. **Keep the Edit option** in the actions dropdown menu (the `...` menu) so admins can still edit customer details from the list if needed.

