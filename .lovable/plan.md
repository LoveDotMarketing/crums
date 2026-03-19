

## Fix "Failed to update work order" on Admin Approval

### Problem
The screenshot shows an admin trying to approve a submitted work order and getting "Failed to update work order." The error toast is generic — it doesn't show the actual cause.

### Root Cause Analysis
- RLS policies are correct (admin ALL policy exists, no WITH CHECK constraints blocking)
- No database triggers on `work_orders` that could interfere
- The `as any` cast hides type safety but shouldn't cause runtime issues
- Most likely cause: transient auth session expiry or network error, but the generic error message makes it impossible to diagnose

### Fix

**Update `src/pages/admin/WorkOrders.tsx`** — `handleAction` function:

1. **Show the actual error message** in the toast instead of a generic "Failed to update work order" — display `error.message` so admins can see what went wrong
2. **Add a session refresh** before the update — call `supabase.auth.getSession()` to ensure the token is fresh before attempting the update
3. **Remove the `as any` cast** on the update call (work_orders is in the generated types) to get proper type safety
4. **Add `.select()` to the update** to confirm the row was actually updated (Supabase returns empty data on update without select, so we can verify 0 rows means the record wasn't found)

### Files Changed
- `src/pages/admin/WorkOrders.tsx` — improve `handleAction` with better error handling and session refresh

