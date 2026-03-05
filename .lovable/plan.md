

## Fix: Abdul's ACH Shows "Not Linked" — Case-Sensitive Email Match

### Root Cause

Abdul's ACH **is** correctly linked in the database. His `customer_applications` record has:
- `stripe_customer_id`: `cus_U4oBrNhek7Fs0K`
- `stripe_payment_method_id`: `pm_1T7dwSLjIwiEGQIhzU647O3c`
- `payment_setup_status`: `completed`

The bug is a **case-sensitive email comparison** on line 233 of `src/pages/admin/Customers.tsx`:

```typescript
const customerProfile = profiles?.find(p => p.email === customer.email);
```

The `customers` table stores `Azptrucking@gmail.com` (capital A), but the `profiles` table stores `azptrucking@gmail.com` (lowercase). The strict `===` comparison fails, so the application record is never found, and ACH shows as "Not Linked."

### Fix

**File: `src/pages/admin/Customers.tsx`** (line 233)

Change the email comparison to case-insensitive:

```typescript
const customerProfile = profiles?.find(
  p => p.email?.toLowerCase() === customer.email?.toLowerCase()
);
```

This is a one-line fix. No database changes needed — Abdul's data is already correct.

