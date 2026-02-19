

# Fix: Ground Link LLC ACH Not Processing on the 15th

## Root Cause Analysis

After investigating Ground Link LLC's account (`dispatch@groundlinkllc.com`, Stripe customer `cus_TxKhmRWcgLA6kJ`), I found **two issues** preventing billing:

### Issue 1: No Subscription Was Ever Created
- ACH bank account is linked (payment method `pm_1SzQ4ILjIwiEGQIhYPnohAWv` attached)
- 8 trailers are assigned and marked as "rented"
- **But there are zero Stripe subscriptions** and zero `customer_subscriptions` records in the database
- Without a subscription, there is nothing to charge -- the system has no billing instructions for this customer

### Issue 2: No Automated Billing Cron Job
The `process-billing` edge function exists but is **not scheduled as a cron job**. Current cron jobs are:
- Outreach automation (hourly)
- Toll reminders (daily 9am)
- Dunning process (daily 9am)
- Changelog sync (weekly)

Even once subscriptions are created, billing sync will only run when an admin manually triggers it -- there is no automatic daily check.

## Customer's Billing Structure
The customer notes specify a **split payment schedule**:
- 1st of month: $2,250.00
- 15th of month: $1,650.00
- Total: $3,900.00/month

Per the existing architecture, this requires **two separate Stripe subscriptions** -- one anchored to the 1st and one anchored to the 15th, each covering a different group of trailers.

## What Will Be Fixed (Code Changes)

### 1. Add `process-billing` Cron Job
Create a database migration to schedule `process-billing` to run daily at 6:00 AM UTC. This ensures Stripe subscription statuses and invoices are automatically synced to the local database every day.

```sql
SELECT cron.schedule(
  'process-billing-daily',
  '0 6 * * *',
  $$SELECT net.http_post(
    url := '<supabase-url>/functions/v1/process-billing',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <cron-secret>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );$$
);
```

### 2. Add `sync-payments` Cron Job
Similarly, `sync-payments` should also run daily to keep payment records current.

```sql
SELECT cron.schedule(
  'sync-payments-daily',
  '0 7 * * *',
  $$SELECT net.http_post(
    url := '<supabase-url>/functions/v1/sync-payments',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <cron-secret>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );$$
);
```

## What the Admin Needs to Do (Not a Code Fix)

The admin must **create the subscriptions** for Ground Link LLC through the admin Billing dashboard:

1. Go to Admin > Billing > Create Subscription
2. **Subscription 1 (1st of month - $2,250):** Select the appropriate trailers, set billing cycle to monthly, set anchor day to 1
3. **Subscription 2 (15th of month - $1,650):** Select the remaining trailers, set billing cycle to monthly, set anchor day to 15
4. After each subscription is created (status will be "incomplete/pending"), click the **"Activate"** button to trigger the first charge using the linked ACH payment method

Once subscriptions exist and are activated, the new daily cron jobs will keep everything synced automatically.

## Files Changed

| File | Change |
|---|---|
| New migration | Add `process-billing-daily` and `sync-payments-daily` cron jobs |

## No Other Code Changes Needed

The ACH setup flow, `create-subscription`, `activate-subscription`, and `process-billing` functions are all working correctly. The issue is purely that no subscription was created for this customer, and the automated billing sync was never scheduled.

