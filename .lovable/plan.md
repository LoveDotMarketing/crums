

## Plan: Configurable Staff Permissions System

Instead of hardcoding what a "Sales" role can see, we'll build a permissions table and an admin UI toggle panel so you can turn sections on/off for any staff member without code changes.

### How it works

1. **New database table: `staff_permissions`** — stores which admin sidebar sections each staff user can access. Each row = one user + one section key (e.g. `applications`, `customers`, `fleet`, `billing`, etc.). Admins get all permissions by default.

2. **New "sales" value added to the `app_role` enum** — so Sales staff can log in and land on the admin dashboard. The `ProtectedRoute` and `useAuth` will treat `sales` like `admin` for routing purposes (both go to `/dashboard/admin`).

3. **Admin UI: Permissions toggle panel** — on the Staff Detail or Staff list page, admins can toggle checkboxes for each sidebar section per staff member. Changes save immediately. This lets you refine what Sales (or any staff) sees without redeploying.

4. **Sidebar filtering** — `AdminSidebar` fetches the current user's permitted sections from `staff_permissions` and hides groups/items they don't have access to. Full admins see everything (bypass check).

5. **Route-level protection** — `ProtectedRoute` or a new wrapper checks permissions server-side too, so navigating directly to a URL they shouldn't access redirects them back.

### Database changes

```sql
-- Add 'sales' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales';

-- Permissions table
CREATE TABLE public.staff_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_key)
);

ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage permissions
CREATE POLICY "Admins can manage staff permissions"
  ON public.staff_permissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Staff can read their own permissions
CREATE POLICY "Staff can view own permissions"
  ON public.staff_permissions FOR SELECT
  USING (auth.uid() = user_id);
```

Section keys will match sidebar items: `dashboard`, `applications`, `fleet`, `archived_trailers`, `dot_inspections`, `work_orders`, `tolls`, `customers`, `staff`, `employee`, `mechanics`, `referrals`, `billing`, `support`, `outreach`, `call_logs`, `lead_sources`, `phone_leads`, `analytics`, `logs`, `content_schedule`, `sitemap`, `indexnow`, `reports`.

### Code changes

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Add `"sales"` to role type union. Treat `sales` like `admin` for dashboard routing. |
| `src/components/ProtectedRoute.tsx` | Allow `sales` role to access admin routes. Add permission check for specific sub-routes. |
| `src/components/admin/AdminSidebar.tsx` | Add `section_key` to each menu item. Fetch user's permissions. Filter visible items. Full admins bypass filter. |
| `src/pages/admin/Staff.tsx` | Add `"sales"` to invite role options. Add permissions toggle UI (checklist of sections per staff member). |
| `src/pages/admin/StaffDetail.tsx` | Add permissions management panel with toggle switches for each section. |
| `supabase/functions/invite-staff/index.ts` | Accept `"sales"` as valid role. |
| `supabase/functions/update-staff-role/index.ts` | Accept `"sales"` as valid role. |

### User experience

- Admin invites a new staff member with role "Sales"
- Sales person logs in, lands on admin dashboard
- They only see sidebar items the admin has enabled for them
- Admin can go to Staff page, click a sales person, and toggle sections on/off instantly
- No redeployment needed to change what Sales can access
