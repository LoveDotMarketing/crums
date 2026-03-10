

# Fix Weekly Subscription Support

## Issues Found

There are two bugs that will prevent your first weekly subscription from working correctly:

### 1. `calculateNextAnchorDate` doesn't handle weekly (Friday) billing
The function in the `create-subscription` backend function treats `anchorDay=5` as "the 5th of the month" instead of "Friday (day 5 of the week)." For weekly billing, it needs to calculate the timestamp of the **next Friday**, not the 5th calendar day.

### 2. Per-trailer billing cycle override not used for Stripe price interval
When a trailer is set to "Weekly – Friday" via the per-trailer dropdown, the frontend correctly sends `billing_cycle: "weekly"` in `trailerBillingSchedules`. However, the backend always uses the **global** `billingCycle` (which stays "monthly" in the UI) when creating Stripe recurring prices. This means the Stripe subscription would be created with monthly intervals even though the intent is weekly.

### 3. Summary label says "Monthly" when it should say "Weekly"
The subscription summary at the bottom shows "Billing: Monthly" and "Monthly Total" even when a weekly trailer is selected (visible in your screenshot).

---

## Fix Plan

### File 1: `supabase/functions/create-subscription/index.ts`

**A. Update `calculateNextAnchorDate` to handle weekly anchor (anchorDay = 5 means Friday)**

Add a new helper `calculateNextWeekdayAnchor(dayOfWeek)` that returns the Unix timestamp of the next occurrence of that weekday (5 = Friday). 

**B. Use per-group billing cycle when creating Stripe prices**

In the subscription creation loop, resolve each group's billing cycle from the per-trailer overrides. If a group's trailers have `billing_cycle: "weekly"`, use `{ interval: "week", interval_count: 1 }` for that group's prices instead of the global `billingInterval`.

**C. Use resolved billing cycle for anchor calculation**

When the resolved group billing cycle is `"weekly"` and anchorDay is 5, call the new weekday anchor function instead of the month-day anchor function.

### File 2: `src/components/admin/CreateSubscriptionDialog.tsx`

**A. Auto-detect effective billing cycle for summary**

When any selected trailer uses "weekly-friday" schedule, update the summary to show "Weekly" instead of "Monthly", and change "Monthly Total" to "Weekly Total" with the correct per-week rate.

---

## What This Enables

After these fixes, you can:
1. Select the trailer with "Weekly – Friday" billing schedule
2. Set deposit to $0
3. Hit "Create Subscription" 
4. Stripe will create a weekly recurring subscription anchored to the next Friday

