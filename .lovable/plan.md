

# Update Dashboards to Reflect Credit Card vs ACH Payment Method

## Problem
Several admin and customer-facing views still hardcode "ACH" labels regardless of whether the customer set up ACH or a credit card. Now that both payment types are supported, the UI should accurately reflect which method is linked.

## Changes

### 1. `src/pages/admin/CustomerDetail.tsx` (~line 451)
- Change label from "ACH Status" to "Payment Method"
- When linked, show the type (e.g., "ACH Linked" or "Card Linked") by reading `payment_method_type` from the application record
- Ensure the application query includes `payment_method_type`

### 2. `src/pages/admin/Customers.tsx` (~lines 262-263, 636, 723-727)
- Rename `ach_linked` to `payment_linked` (or keep name but update labels)
- Update the stats card from "ACH Linked" to "Payment Linked" 
- Include `payment_method_type` in the application select query (~line 193)
- Optionally show breakdown of ACH vs Card in the stats

### 3. `src/pages/admin/Tolls.tsx` (~line 102-110)
- The ACH status icon on tolls is checking `stripe_payment_method_id` — this is fine since it just checks if *any* payment method exists, but the tooltip/label should say "Payment Method" not imply ACH-only

### 4. `src/pages/admin/Applications.tsx` — already correct
- Line 777 already differentiates "Card ✓" vs "ACH ✓" using `payment_method_type`. No change needed.

### 5. `src/components/customer/ApplicationStatusTracker.tsx`
- Check if any step labels reference "ACH" and update to "Payment Method" where appropriate

### Files to update
- `src/pages/admin/CustomerDetail.tsx` — label + badge updates (~5 lines)
- `src/pages/admin/Customers.tsx` — query field, stats labels (~10 lines)
- `src/pages/admin/Tolls.tsx` — tooltip label only if it says "ACH" (~1 line)
- `src/components/customer/ApplicationStatusTracker.tsx` — check/update labels

