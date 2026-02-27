

## Problem

The Customer Detail page has two issues preventing correct subscription display:

1. **Single-subscription query**: The subscription query uses `.maybeSingle()` (line 128), so it only fetches **one** subscription per customer. Ground Link will need two subscriptions (1st and 15th), and the page can't show both.

2. **Missing database data**: Both subscriptions have `next_billing_date = NULL` and Fisneur Jean's subscription item has `billing_anchor_day = NULL`. These need to be populated from Stripe's `current_period_end`.

3. **Subscription items query chains off single subscription**: The `subscriptionItems` and `billingHistory` queries only reference the single `subscription?.id`, missing items from other subscriptions.

## Plan

### 1. Update database records with correct billing data
- Set `next_billing_date = 2026-03-01` for both existing subscriptions (matches Stripe `current_period_end`)
- Set `billing_anchor_day = 1` on Fisneur Jean's subscription item (trailer 446780)

### 2. Refactor CustomerDetail.tsx to support multiple subscriptions
- Change subscription query from `.maybeSingle()` to fetch **all** subscriptions for the customer
- Change `subscriptionItems` query to fetch items across **all** subscription IDs
- Change `billingHistory` query to fetch billing across **all** subscription IDs
- Update the Subscription tab to render each subscription as its own overview card with its trailers grouped underneath
- Show billing anchor day per subscription in the overview (e.g., "Bills on the 1st" / "Bills on the 15th")
- Update the summary card trailer count to sum across all subscriptions
- Update the Charge button to work when any subscription has a `stripe_customer_id`

### 3. Update Subscription tab UI layout
- Loop over each subscription, rendering a Subscription Overview card + its trailers table
- Each overview card shows: type, billing cycle, next billing date, billing anchor day, contract start, end date, deposit, status
- Trailers table remains the same but is scoped to each subscription's items

### Technical Details

**Database updates** (via insert tool):
```sql
UPDATE customer_subscriptions SET next_billing_date = '2026-03-01' WHERE id IN ('c232ab1a-...', 'bb64e771-...');
UPDATE subscription_items SET billing_anchor_day = 1 WHERE id = '43bd075b-...';
```

**CustomerDetail.tsx changes**:
- Line 121-133: Change query to `.select("*").eq("customer_id", customerId!)` returning array instead of `.maybeSingle()`
- Line 136-148: Query subscription_items using `.in("subscription_id", subscriptionIds)` 
- Line 151-164: Query billing_history using `.in("subscription_id", subscriptionIds)`
- Line 277: Update trailer count to use total items across all subs
- Line 312: Update charge button to check any subscription's stripe_customer_id
- Lines 480-598: Refactor subscription tab to map over subscriptions array, each with its own overview + filtered trailers table

