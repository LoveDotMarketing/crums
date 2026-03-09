

# Add 24-Month (2-Year) Lease Contract Type

## Overview
Add `24_month_lease` as a new subscription type across the entire system — database enum, edge functions, admin UI, and customer-facing displays.

## Changes

### 1. Database migration
Add the new enum value to the `subscription_type` enum:
```sql
ALTER TYPE public.subscription_type ADD VALUE '24_month_lease';
```

### 2. Edge function: `create-subscription/index.ts` (line 44)
Add `"24_month_lease"` to the `SubscriptionType` union in the request interface.

### 3. Admin: `CreateSubscriptionDialog.tsx`
- **Line 43**: Add `"24_month_lease"` to `SubscriptionType` union
- **Lines 395-407**: Add auto-set end date logic for 24 months (similar to 6/12 month)
- **Lines 534-548**: Add new radio option between "6 Month Lease" and "Rent for Storage" with a purple/indigo accent, labeled "24 Month Lease" with description "Extended 24-month commitment with recurring billing"

### 4. Admin: `EditSubscriptionPanel.tsx`
- **Line 34**: Add to `SubscriptionType` union
- **Lines 42-48**: Add `{ value: "24_month_lease", label: "24 Month Lease", icon: <CalendarIcon> }` to the `subscriptionTypes` array

### 5. Admin: `Billing.tsx`
- **Line 107**: Add to `SubscriptionType` union
- **Line 1175**: Add `"24_month_lease": { label: "24 Mo Lease", icon: <Calendar>, variant: "secondary" }` to the config

### 6. Customer: `Profile.tsx` (line 41)
Add `"24_month_lease"` to the `SubscriptionType` union.

### 7. Customer: `Billing.tsx` (line 158-164)
Add `"24_month_lease": "24 Month Lease"` to the labels map.

### 8. Customer: `Rentals.tsx` (lines 263-269)
Add case for `24_month_lease` → "24 Mo Lease" badge label.

### 9. Admin: `CustomerFormDialog.tsx` (line 112-118)
Add `case '24_month_lease': return '24 Month Lease';` to the switch.

### 10. Admin: `TrailerDetail.tsx` (line 111-116)
Add `24_month_lease: '24 Month Lease'` to the `AGREEMENT_LABELS` map, and add a `<SelectItem>` for it.

### Files changed (10 total)
- **Database migration** — 1 ALTER TYPE statement
- `supabase/functions/create-subscription/index.ts`
- `src/components/admin/CreateSubscriptionDialog.tsx`
- `src/components/admin/EditSubscriptionPanel.tsx`
- `src/components/admin/CustomerFormDialog.tsx`
- `src/pages/admin/Billing.tsx`
- `src/pages/admin/TrailerDetail.tsx`
- `src/pages/customer/Profile.tsx`
- `src/pages/customer/Billing.tsx`
- `src/pages/customer/Rentals.tsx`

