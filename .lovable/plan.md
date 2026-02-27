

## Problem

Ground Link LLC has 8 trailers on a single Stripe subscription anchored to the 1st. Five of those trailers (903637, 606948, 156175, 166370, 156004) should bill on the **15th**. The remaining 3 should stay on the **1st**.

The root cause is that the `create-subscription` edge function receives `trailerBillingSchedules` from the UI but **ignores it entirely** — it creates one Stripe subscription with a single anchor for all trailers.

## Plan

### 1. Fix Ground Link's existing subscription (immediate data fix)
- Use Stripe tools to identify the 5 trailers (by trailer number) and their Stripe subscription item IDs on `sub_1T5ZS1LjIwiEGQIhaRTuOx5P`
- Remove those 5 items from the current subscription via `update_subscription`
- Create a **new** Stripe subscription for the same customer anchored to the **15th** with those 5 trailers
- Update the database: create a new `customer_subscriptions` row for the 15th-anchored subscription, move the 5 `subscription_items` to it, and populate `billing_anchor_day` on all items

### 2. Update `create-subscription` edge function to auto-split by billing date
- Add `trailerBillingSchedules` to the `SubscriptionRequest` interface
- Group trailers by their resolved anchor day (per-trailer override from `trailerBillingSchedules`, falling back to the global `billingAnchorDay`)
- For each unique anchor day group, create a separate Stripe subscription with the correct `billing_cycle_anchor`
- Create separate `customer_subscriptions` rows per group
- Populate `billing_cycle` and `billing_anchor_day` on each `subscription_items` insert

### 3. Update `subscription_items` inserts to store billing metadata
- In the subscription items creation loop, read from the `trailerBillingSchedules` map for each trailer
- Set `billing_cycle` and `billing_anchor_day` columns so the database accurately reflects each trailer's schedule

### Technical Details

**Edge function grouping logic** (in `create-subscription/index.ts`):
```text
trailerBillingSchedules = { trailerId -> { billing_cycle, billing_anchor_day } }

Group trailers:
  For each trailer:
    anchorDay = trailerBillingSchedules[id]?.billing_anchor_day ?? billingAnchorDay ?? null
  
  groups = Map<anchorDay, trailer[]>

For each group:
  - Create Stripe prices
  - Create Stripe subscription with billing_cycle_anchor for that group's anchor day
  - Insert customer_subscriptions row
  - Insert subscription_items with billing_anchor_day populated
```

**Data fix for Ground Link**: Will use Stripe tools + database insert tool to split the subscription and update records.

