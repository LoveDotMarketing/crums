

## Fix: Employee Dashboard Not Working During Impersonation

### Problem
The Employee Dashboard queries `staff_profiles` using `user.id` from `useAuth()`, which is always the real logged-in user (the admin). During impersonation, it should use the impersonated user's ID instead. Adam's staff profile exists — the dashboard just isn't looking it up correctly.

### Solution

**File: `src/pages/admin/EmployeeDashboard.tsx`**

Update the component to pull `impersonatedUser`, `isImpersonating`, and `effectiveUserId` from `useAuth()`. Replace all references to `user.id` with `effectiveUserId` so that:

- The staff profile query uses the impersonated user's ID
- Leads, subscriptions, and reviews all chain off the correct profile
- The dashboard renders Adam's data when viewing as Adam

This is a single-file change — just swap `user.id` → `effectiveUserId` in the query keys and query functions (approximately 3 occurrences).

