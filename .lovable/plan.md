

## Fix: Trailer 260022 Missing from Roderick McGill's Subscription

### Problem
Trailer 260022 is correctly assigned to Roderick McGill in the `trailers` table (status: `rented`, `customer_id` set), but the `subscription_items` record linking it to his subscription (`920b30f1-2fdc-4dfb-9e29-8e81acdd91bf`) has status `ended` instead of `active`. This causes it to be filtered out of subscription views.

### Solution
Update the subscription item status from `ended` to `active` using a data update (not a migration).

### Technical Detail
```sql
UPDATE subscription_items 
SET status = 'active', updated_at = now()
WHERE subscription_id = '920b30f1-2fdc-4dfb-9e29-8e81acdd91bf'
  AND trailer_id = '41954a74-c47f-4f24-86e2-452568b70526';
```

This is a single data fix — no code changes needed. After this, the trailer will appear under his subscription in billing, customer profile, and the customer's "My Rentals" page.

