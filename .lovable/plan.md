

# Add Manual Billing Anchor Date Selection to Create Subscription Dialog

## Problem
The dialog shows the customer's preferred payment date as read-only info. Admins need to manually select a billing anchor date (e.g., 1st or 15th) because different trailers within the same customer may need different billing dates. The preference is informational but the actual anchor should be admin-controlled.

## Changes

### File: `src/components/admin/CreateSubscriptionDialog.tsx`

1. **Add a `billingAnchorDay` state** (number, default from customer preference when available, otherwise 1).

2. **Replace the read-only preference info box** (lines 404-422) with an interactive section that:
   - Still shows the customer's preferred date as a hint
   - Adds a `Select` dropdown or radio buttons for the admin to pick the billing anchor day (common options: 1st, 15th, or custom day 1-28)
   - Auto-sets to customer preference when a customer is selected, but allows override

3. **Pass `billingAnchorDay` to the edge function** in the mutation body (line 209-226), so the `create-subscription` function uses the admin-selected anchor instead of only relying on the customer application preference.

4. **Update `useEffect`** to sync `billingAnchorDay` state when `customerApplication` data loads (set it to their preference as default, admin can override).

### File: `supabase/functions/create-subscription/index.ts`

5. **Accept `billingAnchorDay`** from the request body and use it as the Stripe subscription's `billing_cycle_anchor` or `billing_anchor_config` parameter, overriding any customer application lookup.

## UX Flow
- Admin selects customer → preference auto-populates anchor day selector
- Admin can override to any day (1-28)
- Per-trailer billing schedule overrides (1st, 15th, weekly) remain independent and work as before for split-billing scenarios
- The subscription-level anchor sets the default; per-trailer overrides create separate Stripe subscriptions as needed

