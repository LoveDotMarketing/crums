

## Problem

Abdul's `customer_applications` record shows `payment_setup_status = 'completed'` and has a `stripe_payment_method_id` (`pm_1T7dwSLjIwiEGQIhzU647O3c`) that is dead/detached in Stripe. The UI shows "ACH ✓" and hides the "Send ACH Setup" button, so there's no way to re-do the setup.

## Fix

### 1. Database: Reset Abdul's ACH status

Run a migration to clear the broken payment method and reset status so the ACH setup flow can be re-initiated:

```sql
UPDATE customer_applications
SET payment_setup_status = 'pending',
    stripe_payment_method_id = NULL
WHERE id = '25b5046d-d4b2-405c-bf78-ba3e2b71039f';
```

### 2. UI: Add a "Reset ACH" option for admins

In `src/pages/admin/Applications.tsx`, update the ACH badge area (~line 773) so that when `payment_setup_status === "completed"`, instead of only showing the static "ACH ✓" badge, also show a small reset button that sets `payment_setup_status` back to `pending` and clears `stripe_payment_method_id`. This prevents needing manual database edits in the future.

The reset button will:
- Update `customer_applications` setting `payment_setup_status = 'pending'` and `stripe_payment_method_id = null`
- Refresh the applications list
- Show a toast confirmation

### Files to update
- **Database migration** — one UPDATE statement for Abdul's record
- `src/pages/admin/Applications.tsx` — add reset ACH button next to the "ACH ✓" badge (~5 lines)

