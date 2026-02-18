
# Fix: Deleted Staff User Isaac Jimenez Still Able to Log In

## Root Cause

The `remove-staff` edge function has a critical gap: it only deletes users whose `user_roles` entry is `admin` or `mechanic`. When the removal was attempted for Isaac Jimenez (`ileejimenez@gmail.com`), his role was already `customer` — so the function returned a 404 "Staff member not found" error and did nothing. His auth account was never deleted.

**Current state of Isaac's account:**
- `auth.users`: Active, NOT deleted, NOT banned
- `user_roles`: Has a `customer` role
- `profiles`: Exists with full data
- Result: He can log in with full customer access

---

## Immediate Fix: Disable Isaac's Account

The first step is to immediately ban Isaac's account so he cannot log in while a proper solution is put in place. This requires a database migration to set `banned_until` in `auth.users` to a far-future date, or a proper deletion.

Since the auth user still exists, the cleanest fix is to delete him entirely via a direct database operation using the service role. This will be done with a migration that calls `auth.users` deletion safely.

---

## Plan

### Step 1: Immediately remove Isaac's account (data fix)
Run a direct SQL operation to:
1. Delete Isaac's `user_roles` record (the `customer` role)
2. Delete Isaac from `auth.users` (which cascades to `profiles` via FK)

This uses the service role via migration to properly clean up the account.

### Step 2: Fix the `remove-staff` edge function
The function currently blocks removal if the user's role is not `admin` or `mechanic`. This guard is too strict — an admin should be able to fully remove any user from the system regardless of their current role. The fix:

- Remove the role-type restriction from the target user check
- Check that the user exists (in `user_roles` OR `profiles`) instead of requiring a specific role
- Delete their role entry regardless of role type
- Delete the auth user
- Also delete their profile explicitly as a fallback

### Step 3: Add a "Remove Customer" capability on the Customers page
The admin Customers page currently has no way to fully delete/ban a customer account. Add a danger-zone delete action that calls a new or updated edge function to properly remove a customer's auth account while preserving their billing/subscription records for audit purposes.

---

## Technical Details

### Files Changed
- Database migration: Delete Isaac's auth user and role
- `supabase/functions/remove-staff/index.ts`: Remove the role-type restriction on target user check

### Fix to `remove-staff/index.ts`
Change the target user check from:
```text
// BEFORE (broken): only finds admin/mechanic roles
.in("role", ["admin", "mechanic"])
```
To:
```text
// AFTER (fixed): finds any role OR falls back to checking profiles
```
Check if user exists in `profiles` table instead, then delete from `user_roles` (any role) and from `auth.users`.

### Data Migration (Isaac's account)
```text
-- Step 1: Delete role
DELETE FROM user_roles WHERE user_id = '4d24eb80-6edc-4b4f-ab91-dccb4565e5fb';

-- Step 2: Delete profile (cascade will handle auth)
-- Auth deletion must be done via service role admin API in the migration
```

Note: The auth.users deletion must be done via the edge function or admin API call since direct SQL manipulation of auth schema is restricted. The migration will handle the `user_roles` and `profiles` cleanup, and the edge function fix will allow a proper re-deletion.

### Security Improvement
The updated `remove-staff` function will:
1. Accept any user ID (not just admin/mechanic)
2. Look up the user by profile existence
3. Delete from `user_roles` (all matching records)
4. Delete from `auth.users` via the admin API
5. Log the action properly
