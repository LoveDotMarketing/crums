

# Authentication and Authorization Audit Results

## Summary

The authentication and authorization system is well-architected. After a thorough review, **no critical vulnerabilities were found**. Below is the detailed audit of each area, with one minor hardening improvement proposed.

---

## 1. Client-Side Authentication Logic -- SECURE

**Finding:** Authentication is fully handled server-side via JWT-based sessions.

- `signIn` calls `supabase.auth.signInWithPassword()` -- password validation happens on the server
- `signUp` calls `supabase.auth.signUp()` -- account creation is server-side
- Role assignment uses `set_user_role()` SECURITY DEFINER function, which restricts self-assignment to the `customer` role only -- admin/mechanic roles cannot be self-assigned
- Role fetching reads from `user_roles` table with proper RLS policies
- `ProtectedRoute` component gates route access based on server-fetched roles, not client-side storage
- Password reset uses `supabase.auth.updateUser()` with a recovery session validated server-side

**Verdict:** No issues found.

---

## 2. Rate Limiting on Login -- IMPLEMENTED

**Finding:** Brute-force protection is already in place.

- `check_login_attempt()` SECURITY DEFINER function checks if a login is allowed before attempting authentication
- `record_failed_login()` SECURITY DEFINER function tracks failures and locks accounts after 5 attempts for 15 minutes
- `reset_login_attempts()` clears the counter on successful login
- The `login_attempts` table has admin-only RLS (SELECT/DELETE), with SECURITY DEFINER functions bypassing RLS for enforcement
- The Login UI properly disables the submit button and displays lockout alerts

**Minor observation:** `checkLoginAllowed` fails open on database errors (returns `allowed: true`). This is a common pragmatic pattern -- failing closed would lock out all users during a database outage. This is an acceptable tradeoff.

**Verdict:** No issues found.

---

## 3. Impersonation Vulnerabilities -- SECURE BY DESIGN

**Finding:** The impersonation system is a client-side UI convenience, not a security mechanism.

How it works:
- Admin clicks "View As" on a customer/mechanic record
- React state (`impersonatedUser`) is set with the target user's info
- The admin's JWT remains unchanged -- `auth.uid()` always returns the real admin ID
- RLS policies on all tables grant admin full access via `has_role(auth.uid(), 'admin')`, so admins already have legitimate access to all data
- Edge functions that handle sensitive operations (ACH bank linking, payments) validate the JWT directly, which correctly identifies the admin -- not the impersonated user. These operations are properly disabled during impersonation in the UI.
- Impersonation start/stop events are logged to `user_activity_logs` with full audit trail (target user ID, email, role)
- Only admin pages (`Customers.tsx`, `Staff.tsx`, `Mechanics.tsx`, `CustomerDetail.tsx`) expose the impersonation button

**Verdict:** No vulnerabilities. The system cannot be exploited to bypass RLS or perform unauthorized actions because the actual auth token is never changed.

---

## 4. One Hardening Improvement (Low Priority)

**Issue:** The `startImpersonation` function does not verify the caller's role before setting impersonation state. While only admin pages render the "View As" button, the function itself in `useAuth.tsx` could theoretically be called from any component.

**Proposed fix:** Add a guard at the top of `startImpersonation` that checks `userRole === 'admin'` before proceeding.

### Change

| File | Change |
|---|---|
| `src/hooks/useAuth.tsx` (line 66) | Add admin role guard at start of `startImpersonation` function |

The change is a single guard clause:

```typescript
const startImpersonation = async (targetUser: ImpersonatedUser) => {
  // Only admins can impersonate
  if (userRole !== 'admin') {
    console.error('[auth] Impersonation attempted by non-admin user');
    toast.error('Unauthorized: Only administrators can use this feature.');
    return;
  }
  // ... rest of existing code
};
```

This is defense-in-depth. Even without this guard, impersonation cannot bypass server-side security because the JWT is never changed.

---

## Overall Assessment

| Area | Status |
|---|---|
| Password auth handled server-side | Secure |
| Role assignment restricted | Secure |
| Protected routes use server-fetched roles | Secure |
| No roles in localStorage/cookies | Secure |
| Login rate limiting (5 attempts / 15 min lockout) | Implemented |
| Impersonation audit logging | Implemented |
| Impersonation cannot bypass RLS | Secure |
| Edge functions validate real JWT | Secure |
| Impersonation client-side guard | Needs minor hardening |

