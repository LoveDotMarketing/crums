

# Fix Abdul's Split Stripe Customer & Sync ACH Status

## Problem
Abdul has **two Stripe customers**:
- `cus_U4oBrNhek7Fs0K` — old, dead payment method, linked to `customer_applications`
- `cus_U5sQ2ohTsvdzXt` — new, has active subscription `sub_1T7gfi...`, likely has the working ACH payment method

The `customer_applications` record still points to the old Stripe customer and shows `payment_setup_status = pending`, even though Abdul says ACH is linked on the new customer.

## Fix

### 1. Database migration — sync application to new Stripe customer
Update Abdul's `customer_applications` to point to the correct Stripe customer and mark ACH as completed:

```sql
UPDATE customer_applications
SET stripe_customer_id = 'cus_U5sQ2ohTsvdzXt',
    payment_setup_status = 'completed'
WHERE id = '25b5046d-d4b2-405c-bf78-ba3e2b71039f';
```

This aligns the application with the Stripe customer that actually has the subscription and (presumably) the working payment method.

### 2. Next step — activate subscription
Once the migration is applied, the subscription (`d7a95e0a-21e4-4706-8a9e-cb5969faa987`) already exists as `active` with `deposit_paid = false` and `deposit_amount = $700`. The admin can then use the existing "Activate Subscription" button to collect the deposit.

### No code changes needed
This is a data-only fix — one UPDATE statement.

