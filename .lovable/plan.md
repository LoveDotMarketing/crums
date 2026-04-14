

## Problem: Sales Role Gets Empty Data Due to RLS

The salesman logs in with the `sales` role. The dashboard queries tables like `trailers`, `customers`, `tolls`, `billing_history`, etc. — all of which have RLS policies that only grant SELECT to users with the `admin` app_role. Since `sales` is not `admin`, every query silently returns zero rows, so the cards show no numbers.

When you impersonate the salesman, your actual auth session still has the `admin` role, so RLS passes and data appears.

### Solution

Add a `sales` value to the `app_role` enum, then add SELECT RLS policies on the relevant tables so sales users can read dashboard data. This mirrors what admin can see (filtered by their staff_permissions on the UI side).

### Steps

**1. Database migration — extend enum and add RLS policies**

```sql
-- Add sales to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales';

-- Add SELECT policies for sales role on dashboard-relevant tables
CREATE POLICY "Sales can view trailers" ON public.trailers FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view customers" ON public.customers FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view tolls" ON public.tolls FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view billing history" ON public.billing_history FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view maintenance records" ON public.maintenance_records FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view applications" ON public.customer_applications FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view profiles" ON public.profiles FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));
```

**2. Verify the salesman's `user_roles` entry** — confirm they have a row with `role = 'sales'` in the `user_roles` table.

### Why This Fixes It
- RLS is enforced at the database level regardless of UI permissions
- The UI code (staff_permissions, ProtectedRoute) correctly lets sales users navigate to admin pages, but the database rejects their reads
- Adding SELECT policies for `sales` on these tables gives them read access matching what the UI intends to show

### No Code Changes Needed
The React components already work correctly — the issue is purely database-level access.

