

# Fix: Add Missing Admin Role for lovedotmarketing@gmail.com

## Problem
After logging in, the app queries the `user_roles` table to determine which dashboard to redirect to. Your account (`lovedotmarketing@gmail.com`) has no entry in this table, so `userRole` remains `null` and the redirect logic never executes -- leaving you stuck on the login page.

## Solution
Insert the admin role for your account into the `user_roles` table.

---

## Technical Details

### Database Change
Run a single SQL insert to add your admin role:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('b51b1d07-969d-4139-b7c3-2d55fef9ca8c', 'admin');
```

No code changes are needed. Once the role exists, the existing login flow will detect `userRole === "admin"` and redirect to `/dashboard/admin` as expected.

