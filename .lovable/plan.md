

## Fix: Password Reset Redirects to Lovable Instead of CRUMS

### Problem
When an admin triggers "Send Password Reset" from the Customers page, the code uses `window.location.origin` for the redirect URL. Since the admin is browsing the Lovable preview (`id-preview--*.lovable.app`), the reset email sends the customer to the Lovable preview URL instead of `https://crumsleasing.com`.

### Fix
Hardcode the production domain `https://crumsleasing.com` for the `redirectTo` in all three locations where `resetPasswordForEmail` is called, instead of relying on `window.location.origin`.

### Files Modified

| File | Change |
|------|--------|
| `src/pages/admin/Customers.tsx` | Change `redirectTo` from `${window.location.origin}/reset-password` to `https://crumsleasing.com/reset-password` |
| `src/pages/admin/Staff.tsx` | Same change |
| `src/pages/ForgotPassword.tsx` | Same change |

This ensures the password reset link always points to the production CRUMS site regardless of where the admin is browsing from.

