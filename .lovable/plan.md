

## Problem

Ground Link has 8 trailers assigned, but 3 are already on a pending subscription. The Create Subscription dialog shows all 8 as selectable because they're all assigned to the customer. The admin has no way to tell which ones are already subscribed — so they select all 8, and the edge function rejects it because 3 overlap.

## Solution

Filter out trailers that are already on an active/pending/paused subscription from the available trailer list in the Create Subscription dialog.

### Change: `src/components/admin/CreateSubscriptionDialog.tsx`

1. **Add a query** to fetch existing subscription items for the selected customer:
   - Query `subscription_items` joined with `customer_subscriptions` where `customer_id = selectedCustomerId` and `status IN ('active', 'pending', 'paused')`
   - Collect the set of `trailer_id`s already subscribed

2. **Filter the trailer list** (around line 168): After fetching available trailers, exclude any whose `id` is in the already-subscribed set. Alternatively, mark them with a "Subscribed" badge and make them unselectable.

**Approach**: Filter them out entirely so the admin only sees trailers that can actually be added. This is the simplest and least error-prone approach.

### Technical Detail

In the `availableTrailers` query (lines 159-178), after fetching results, filter out trailers whose IDs appear in any active/pending/paused subscription's `subscription_items`. This requires a secondary query or a post-fetch filter using the existing subscriptions data.

