

## Reset BMS Logistics ACH Setup

**Current state:** BMS Logistics (`bmslogisticsdispatch@gmail.com`, application `7c6ec643`) has:
- `payment_setup_status = 'sent'` — ACH setup link was sent
- `stripe_payment_method_id = null` — penny verification was never completed
- Stripe customer `cus_U8CRQOeIKUwWRJ` exists but has 0 payment methods attached
- Edge logs confirm repeated failed setup attempts with no payment methods resolving

The customer never completed the micro-deposit (penny) verification, so the bank account was never confirmed and the setup is stuck.

### Fix

**Database migration** — Reset the application's payment setup status so the ACH setup flow can be re-initiated:

```sql
UPDATE customer_applications
SET payment_setup_status = 'pending',
    stripe_payment_method_id = NULL
WHERE id = '7c6ec643-c1ad-40fe-b67c-80e25f82dee0';
```

After this runs, you'll be able to click "Send ACH Setup" again from the Applications page, and BMS will get a fresh link to set up their bank account and complete the penny verification.

### Files changed
- **Database migration only** — no code changes needed

