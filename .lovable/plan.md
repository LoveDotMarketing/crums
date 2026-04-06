

## Fix Monthly Revenue: Show Collected vs Expected

### Problem
The "Monthly Revenue" stat card on the Billing page only shows **expected** revenue (sum of active subscription `monthly_rate` values). It does not show **actual money collected** this month from the `billing_history` table. The Admin Dashboard's "Collected This Month" card only tracks toll collections, not lease payments.

### Changes

**File: `src/pages/admin/Billing.tsx`**

1. Add a query to fetch this month's actual collections from `billing_history` where `status = 'succeeded'` and `paid_at` falls within the current month.

2. Replace the single "Monthly Revenue" stat card with two values:
   - **Collected This Month**: actual `succeeded` payments from `billing_history` (green, prominent)
   - **Expected Monthly**: current sum of active `monthly_rate` values (smaller, secondary text below)

3. Add a collection rate indicator showing `(collected / expected) * 100%`.

**File: `src/pages/admin/AdminDashboard.tsx`**

4. Update the "Collected This Month" card (currently toll-only) to also include lease payment collections from `billing_history`. Show combined total with a breakdown subtitle like "$X leases + $Y tolls".

### Technical Details

**Billing history query** (new, in Billing.tsx):
```sql
SELECT SUM(net_amount) FROM billing_history
WHERE status = 'succeeded'
  AND paid_at >= start_of_current_month
```

**AdminDashboard query update**: Add a parallel fetch to `billing_history` for succeeded payments this month, combine with existing toll collections.

### Files Modified
| File | Change |
|------|--------|
| `src/pages/admin/Billing.tsx` | Add collected-this-month query, update Monthly Revenue card to show collected vs expected |
| `src/pages/admin/AdminDashboard.tsx` | Update "Collected This Month" card to include lease payments from billing_history |

