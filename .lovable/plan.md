

# Add Financial Visibility Permission Toggles

## What This Does
Adds two new permission toggles for staff members so admins can hide sensitive financial data from sales users:
- **"View Dashboard Revenue"** — controls visibility of the "Collected This Month" card on the Admin Dashboard
- **"View Payment Amounts"** — controls visibility of the Total Paid / Pending / Failed summary cards AND the Amount column on the Payments page

## Changes

### 1. Extend the permissions system
**File:** `src/hooks/useStaffPermissions.ts`

Add two new section keys to `ALL_SECTION_KEYS` and `SECTION_LABELS`:
- `view_dashboard_revenue` → "View Dashboard Revenue"
- `view_payment_amounts` → "View Payment Amounts"

These are "sub-permissions" — toggleable independently from the page-level `dashboard` and `payments` permissions.

### 2. Hide "Collected This Month" for restricted users
**File:** `src/pages/admin/AdminDashboard.tsx`

- Import `useStaffPermissions`
- If `!hasAccess('view_dashboard_revenue')`, filter out the "Collected This Month" stat card from the rendered array

### 3. Hide financial totals on Payments page
**File:** `src/pages/admin/Payments.tsx`

- Import `useStaffPermissions`
- If `!hasAccess('view_payment_amounts')`:
  - Hide the three summary cards (Total Paid, Pending, Failed)
  - Hide the "Amount" column from the payments table

### 4. Add toggles to Staff Detail panel
The existing Staff Detail page already renders toggles for each key in `ALL_SECTION_KEYS` — adding the new keys will automatically create the toggle UI. No additional changes needed there.

