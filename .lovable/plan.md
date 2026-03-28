

## Plan: Fix Toll Customer ID Mismatch

### Problem
The toll system has a customer ID mismatch:
- **TollFormDialog** saves `profiles.id` (auth user ID) as `customer_id` when creating tolls
- **CustomerDetail page** queries tolls using `customers.id` (from the URL)
- These are different IDs (e.g., Ground Link: profile = `d9eb849b...`, customer = `31b4ef87...`)
- Result: tolls created for a customer don't show up on their detail page

### Solution
Update the **TollFormDialog** to use `customers` table instead of `profiles` for the customer dropdown. This aligns the toll `customer_id` with the `customers.id` used throughout the admin panel.

### Changes

**1. Update `src/components/admin/TollFormDialog.tsx`**
- Change `fetchProfiles` to fetch from `customers` table instead of `profiles`
- Select `id, full_name, email, company_name` from `customers`
- Update dropdown to show customer name/company instead of profile name
- Rename state from `profiles` to `customers` for clarity

**2. Update `src/pages/admin/Tolls.tsx`**
- Change the query join from `profiles:customer_id(...)` to `customers:customer_id(...)` to match the new customer ID source
- Update `getCustomerName` to use customer fields (`full_name`, `company_name`)

**3. Fix existing toll data (migration)**
- Run a SQL migration to update existing tolls' `customer_id` from `profiles.id` to `customers.id` by matching via email

### Technical detail
The `customers` table has `id`, `full_name`, `email`, `company_name`. Since `customer_id` in tolls has no foreign key constraint, both the old profile IDs and new customer IDs will work structurally — we just need consistency.

