

## Add "Send Password Reset" to Customer Actions Dropdown

### Change

Add a "Send Password Reset" menu item to the customer actions dropdown on the Customers page. When clicked, it calls the Supabase Auth recovery endpoint to send a password reset email to that customer.

### File: `src/pages/admin/Customers.tsx`

1. Add a `KeyRound` icon import from lucide-react
2. Add state for tracking which customer is having a reset sent (`sendingResetFor`)
3. Add a `handleSendPasswordReset` function that:
   - Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
   - Shows success/error toast
4. Add a new `DropdownMenuItem` labeled "Send Password Reset" (with `KeyRound` icon) inside the `{customer.email && (...)}` block, right after "View As Customer"

The menu item will only appear for customers that have an email address, and will show a loading state while the reset is being sent.

