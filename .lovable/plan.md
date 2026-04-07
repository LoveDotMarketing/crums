

## Fix: Sort Billing Subscriptions by Most Recent Activity

### Problem
The billing subscriptions list sorts by `created_at` descending. Roderick McGill's subscription was created on March 9, so even though his deposit was just charged (updating `updated_at` to today), he appears far down the list.

### Solution
Change the sort order from `created_at` to `updated_at` so that subscriptions with recent activity (deposits, status changes, edits) float to the top.

### Technical Change
**File: `src/pages/admin/Billing.tsx` (line 739)**
- Change `.order("created_at", { ascending: false })` to `.order("updated_at", { ascending: false })`

This is a one-line change. Subscriptions that were recently modified (deposit paid, status updated, edited) will now appear at the top of the billing list.

