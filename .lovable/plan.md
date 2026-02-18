
# Add Weekly Payment Option (Every Friday) + Per-Trailer Billing Schedule

## What's Being Changed

Right now the system supports 4 billing cycles (weekly, biweekly, semimonthly, monthly) but **weekly doesn't anchor to Friday specifically**, and customers with multiple trailers cannot split them across different billing dates (e.g., Ground Link wanting some trailers billed on the 1st and others on the 15th). This plan adds per-trailer billing schedule flexibility.

---

## The Core Problem

The current data model links one billing schedule to the entire **subscription**. There is no concept of per-trailer billing dates or per-trailer billing cycle. To support "2 trailers on the 1st, 3 trailers on the 15th," we need to add billing schedule fields at the **subscription item** (trailer) level.

---

## Plan

### Step 1: Database Migration

Add two columns to `subscription_items` to allow per-trailer billing overrides:

- `billing_cycle` — overrides the subscription-level cycle for this specific trailer (nullable; falls back to subscription's cycle when null)
- `billing_anchor_day` — the day-of-month anchor (1, 15, etc.) or day-of-week for weekly (stored as integer, e.g., 5 = Friday)

This is additive and backward-compatible — existing items will have NULL values and continue to use the subscription-level settings.

Also update the `billing_cycle` enum to confirm `weekly` is present (it is — confirmed: weekly, biweekly, semimonthly, monthly already exist in the enum).

No new enum values are needed. "Due every Friday" is `billing_cycle = 'weekly'` with `billing_anchor_day = 5` (Friday = day 5).

### Step 2: Update `CreateSubscriptionDialog` — Per-Trailer Billing

Add per-trailer billing controls directly in the trailer selection table. When a trailer is selected, show two additional columns in that trailer's row:

- **Billing Cycle** dropdown: Monthly / 1st & 15th / Weekly (Friday) — if left as "Use Subscription Default," the item inherits the subscription-level setting
- **Billing Date** dropdown: Only shows when "Monthly" is selected → 1st or 15th. Auto-set to "Every Friday" for weekly.

This allows Ground Link to select 5 trailers and set some to "1st of month" and others to "15th of month."

The subscription summary section will be updated to show a breakdown by billing schedule.

### Step 3: Update `EditSubscriptionDatesDialog` (existing admin dialog)

Currently only lets admins change subscription-level billing anchor. Update it to also let admins change billing per trailer item, showing each active trailer with its own billing cycle/date picker.

### Step 4: Update `EditBillingDateDialog`

Currently only shows 1st / 15th options. Add a third option: "Every Friday (Weekly)" with the correct visual card styling matching the existing 1st/15th cards. Store weekly preference as `billing_anchor_day = 5` (Friday) combined with `billing_cycle` preference noted in a new `preferred_billing_cycle` column on `customer_applications`.

### Step 5: Update Customer Application Page

The application page asks for billing preference (1st or 15th). Update it to offer three choices:
- 1st of the month
- 15th of the month  
- Every Friday (Weekly)

When weekly is selected, store `billing_anchor_day = 5` and a new `preferred_billing_cycle = 'weekly'` field on `customer_applications`.

### Step 6: Update Customer Billing Page Display

Update the "Payment Due Date" card to correctly display:
- "1st of each month"
- "15th of each month"
- "Every Friday"

Also update the Leased Trailers table to show a "Billing" column displaying each trailer's effective billing schedule (per-item if set, subscription default otherwise).

### Step 7: Update Admin Billing Page Summary

The `ReadyToActivateCard` currently shows "1st" or "15th" — update the display to also handle "Every Friday (Weekly)."

---

## Technical Details

### Database Changes (Migration)

```sql
-- Add per-trailer billing fields to subscription_items
ALTER TABLE public.subscription_items
  ADD COLUMN IF NOT EXISTS billing_cycle text NULL,
  ADD COLUMN IF NOT EXISTS billing_anchor_day integer NULL;

COMMENT ON COLUMN public.subscription_items.billing_cycle IS 
  'Per-trailer billing cycle override. NULL = inherit from parent subscription.';
COMMENT ON COLUMN public.subscription_items.billing_anchor_day IS 
  'Anchor day: 1 or 15 for monthly, 5 (Friday) for weekly. NULL = inherit from parent subscription.';

-- Add preferred_billing_cycle to customer_applications
ALTER TABLE public.customer_applications
  ADD COLUMN IF NOT EXISTS preferred_billing_cycle text NULL;

COMMENT ON COLUMN public.customer_applications.preferred_billing_cycle IS 
  'weekly, semimonthly, monthly — customer preference captured during application';
```

### Files Modified

- `supabase/migrations/[new].sql` — Schema changes above
- `src/components/admin/CreateSubscriptionDialog.tsx` — Add per-trailer billing columns in the trailer table
- `src/components/admin/EditBillingDateDialog.tsx` — Add weekly/Friday option as third card choice
- `src/components/admin/EditSubscriptionDatesDialog.tsx` — Show per-trailer billing overrides
- `src/pages/customer/Application.tsx` — Add "Every Friday" as billing preference option
- `src/pages/customer/Billing.tsx` — Show per-trailer billing, update "Every Friday" display
- `src/components/admin/ReadyToActivateCard.tsx` — Update billing date display for weekly

### Per-Trailer Billing UI in CreateSubscriptionDialog

When a trailer is selected in the table, two new columns appear in that trailer's row:

```
| ✓ | VIN | Type | Year | Default Rate | Custom Rate | Lease to Own | Billing Cycle | Billing Date |
|   |     |      |      |              |             |              | [dropdown]    | [dropdown]   |
```

Billing Cycle options per trailer:
- `(default)` — inherit from subscription
- `Monthly - 1st` → sets billing_cycle=monthly, billing_anchor_day=1
- `Monthly - 15th` → sets billing_cycle=monthly, billing_anchor_day=15  
- `Weekly - Friday` → sets billing_cycle=weekly, billing_anchor_day=5

### Subscription Summary Update

The summary box at the bottom will break trailers into billing groups:

```
Billing Summary:
  • 2 trailers — Monthly (1st): $1,400/mo
  • 3 trailers — Monthly (15th): $2,100/mo
  • 1 trailer — Weekly (Friday): $175/wk
```

### Billing Page Display Logic

```typescript
const getEffectiveBillingLabel = (item, subscription) => {
  const cycle = item.billing_cycle || subscription.billing_cycle;
  const anchor = item.billing_anchor_day;
  if (cycle === 'weekly') return 'Every Friday';
  if (cycle === 'semimonthly') return '1st & 15th';
  if (cycle === 'monthly' && anchor === 15) return '15th of month';
  if (cycle === 'monthly' && anchor === 1) return '1st of month';
  return cycle;
};
```

### Stripe Integration Note

The per-trailer billing dates will be stored in the database for admin reference and display purposes. The actual Stripe billing cycle is set at the subscription level when activated. For customers with split billing (some trailers on 1st, some on 15th), the admin will create **two separate Stripe subscriptions** — the data model supports this since each trailer's billing schedule is tracked on the `subscription_item`. The admin UI will visually group trailers by billing schedule to make this easy to communicate to the billing team.
