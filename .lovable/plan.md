

## Fix: Allow multiple subscriptions per customer

### Root Cause
The `customer_subscriptions` table has a `UNIQUE (customer_id)` constraint. When trying to create a second subscription for Ground Link (who already has one pending subscription), the insert fails with `duplicate key value violates unique constraint "customer_subscriptions_customer_id_key"`.

The system architecture explicitly supports multiple subscriptions per customer for split billing, so this constraint is incorrect.

### Change

**Database migration**: Drop the unique constraint on `customer_id`:
```sql
ALTER TABLE public.customer_subscriptions DROP CONSTRAINT customer_subscriptions_customer_id_key;
```

That's the only change needed. The edge function already created the Stripe subscription successfully (sub_1T6fdu...) — it just failed to save the local record. After removing the constraint, the admin can retry the subscription creation for the 5 trailers.

