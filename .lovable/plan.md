

## Plan: Add Missing Sales RLS Policies

The salesman has toggle access to 11 sections (dashboard, applications, fleet, archived_trailers, dot_inspections, work_orders, tolls, customers, employee, referrals, payments). The core dashboard tables already have sales SELECT policies, but **12 additional tables** queried by those pages are missing sales read access — meaning those pages will show empty data.

### Database Migration

Add SELECT policies for the `sales` role on:

| Table | Why Needed |
|-------|-----------|
| `customer_subscriptions` | Employee Dashboard, Referrals, Payments |
| `subscription_items` | Billing/Payments trailer line items |
| `dot_inspections` | DOT Inspections page |
| `dot_inspection_photos` | DOT Inspections photo viewer |
| `work_orders` | Work Orders page |
| `work_order_line_items` | Work Orders line items |
| `referral_codes` | Referrals page |
| `referrals` | Referrals page |
| `partners` | Referrals page |
| `partner_commissions` | Referrals page |
| `staff_profiles` | Employee Dashboard (already has "own profile" policy, but sales user needs it) |
| `performance_reviews` | Employee Dashboard (own reviews) |

Each policy follows the same pattern:
```sql
CREATE POLICY "Sales can view [table]"
  ON public.[table] FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'sales'::app_role));
```

For `staff_profiles` and `performance_reviews`, the existing "Staff can view own profile" policy should already work since the sales user is staff. I'll verify and only add if missing.

### No Code Changes
The React components and staff_permissions toggles already handle visibility correctly — this is purely a database access fix.

