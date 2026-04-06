

## Fix: Only Charge Deposit at Subscription Creation (Not First Month)

### Problem
When creating a subscription, the system charges **deposit + first month's rent** immediately. The business rule is: only the deposit should be charged upfront. The recurring trailer fee should begin on the anchored billing date (1st, 15th, or auto-calculated).

Two issues cause this:
1. **Stripe backend**: `proration_behavior: "create_prorations"` generates a prorated charge for the period between now and the anchor date on the subscription's first invoice, which Stripe attempts to collect immediately.
2. **UI summary**: `firstChargeTotal = totalMonthlyRate + depositAmount` misleadingly shows deposit + monthly rate as the immediate charge.

### Solution

**1. Edge function: `supabase/functions/create-subscription/index.ts`**
- Change `proration_behavior` from `"create_prorations"` to `"none"` so Stripe does NOT charge for the gap period between creation and the anchor date
- The first recurring charge will happen on the anchor date, not at creation time

**2. UI summary: `src/components/admin/CreateSubscriptionDialog.tsx`**
- Change `firstChargeTotal` to equal only `depositAmount` (not deposit + monthly rate)
- Update the "First Charge" label to "Immediate Charge (Deposit Only)"
- Add a note showing when the first recurring billing will begin (the anchor date)
- Adjust the large subscription warning threshold to use just the deposit amount

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/create-subscription/index.ts` | Change `proration_behavior` to `"none"` |
| `src/components/admin/CreateSubscriptionDialog.tsx` | Fix first charge calculation to deposit-only, update labels |

