

## Add 6-Month Lease Subscription Option

### 1. Database Migration — Add enum value

```sql
ALTER TYPE public.subscription_type ADD VALUE '6_month_lease';
```

This adds the new value to the existing `subscription_type` enum used by the `customer_subscriptions` table.

### 2. Update TypeScript type aliases (3 files)

Add `"6_month_lease"` to the `SubscriptionType` union in:
- `src/components/admin/CreateSubscriptionDialog.tsx` (line 43)
- `src/pages/admin/Billing.tsx` (line 105)
- `src/pages/customer/Profile.tsx` (line 41)

### 3. Add radio option in CreateSubscriptionDialog

Insert a new radio card between "Standard 12 Month Lease" and "Rent for Storage" with:
- Label: **6 Month Lease**
- Description: "Short-term 6-month commitment with recurring billing"
- Icon: `FileText` (matches standard lease styling)

### 4. Auto-set end date for 6-month lease

Update `handleSubscriptionTypeChange` so selecting `6_month_lease` auto-sets end date to 6 months from now (similar to how `standard_lease` sets 12 months).

### 5. Update label/display mappings (4 locations)

| File | Function/Location |
|------|-------------------|
| `src/pages/admin/Billing.tsx` | `getSubscriptionTypeLabel` — add `6_month_lease` entry |
| `src/pages/customer/Billing.tsx` | `getSubscriptionTypeLabel` — add `6_month_lease: "6 Month Lease"` |
| `src/components/admin/CustomerFormDialog.tsx` | `formatSubscriptionType` — add case + badge color (green variant) |
| `src/pages/admin/CustomerDetail.tsx` | Already uses `.replace(/_/g, " ")` — works automatically |

### 6. Update edge function type

Add `"6_month_lease"` to the `subscriptionType` union in `supabase/functions/create-subscription/index.ts` (line 44). No logic changes needed — the edge function passes the type through to the database.

### 7. Customer Rentals page

The `Rentals.tsx` page uses `subscription_type` as a plain string, so it will work without changes. The "Leased" badge label will display correctly.

### Summary
- 1 database migration (enum addition)
- 6 files updated with the new type value and labels
- Auto-sets 6-month end date when selected
- No breaking changes — purely additive

