

# Fix: Show Customer's Assigned Trailers in Create Subscription Dialog

## What's Wrong

The Create Subscription dialog currently only shows trailers with `status = "available"` and `customer_id = null`. Ground Link LLC has 8 trailers already assigned to them (status "rented", customer_id set), but they appear nowhere in the dialog -- so you only see 3 unrelated available trailers.

Additionally, the customer dropdown filters OUT any customer who already has a subscription. Since we now support split billing (multiple subscriptions per customer), this filter is too aggressive. A customer with one active subscription should still appear if you need to create a second billing schedule.

## Changes

### 1. Update trailer query to include customer's assigned trailers
**File:** `src/components/admin/CreateSubscriptionDialog.tsx` (lines 158-173)

Change the trailer query so that when a customer is selected, it fetches:
- Globally available trailers (status = "available", no customer) -- as today
- Trailers already assigned to the selected customer (any status) -- NEW

The query key will include `selectedCustomerId` so it re-fetches when the customer changes. Uses Supabase `.or()` filter to combine both conditions.

### 2. Update customer dropdown to show ALL active customers
**File:** `src/components/admin/CreateSubscriptionDialog.tsx` (lines 132-156)

Remove the filter that excludes customers with existing subscriptions. All active customers should be selectable since split billing requires creating multiple subscriptions for the same customer.

Both changes are in a single file with no backend modifications needed.

