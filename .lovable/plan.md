

## Plan: Realign GroundLink Subscriptions to 1st & 15th Billing

### Diagnosis

GroundLink (Ground Link LLC) has **two active subscriptions** in your system, intentionally split for half-and-half billing:

| Sub | Trailers | Monthly Total | Intended Anchor Day | Actual Stripe Billing |
|---|---|---|---|---|
| `81046ac5...` (sub_1T6fyx) | 5 trailers (156004, 156175, 166370, 606948, 903637) | **$3,800** | **15th** | Currently Apr 11 → May 12 (charged Apr 14) |
| `c232ab1a...` (sub_1T5ZS1) | 3 trailers (166367, 603989, 606951) | **$2,300** | **1st** | Currently Mar 28 → Apr 28 |

The `billing_anchor_day` is correctly set in your DB (1 and 15), but Stripe's `billing_cycle_anchor` was set to whenever the subscription was originally created (Feb 27 and Mar 2), so Stripe keeps billing near those dates instead of the 1st and 15th. The Apr 14 charge of $3,800 in your screenshot confirms this — it should have been Apr 15.

### Fix

Use Stripe's `billing_cycle_anchor` parameter with `proration_behavior: 'none'` to push each subscription's next billing date to the correct calendar day, with no proration charges.

**Sub `sub_1T5ZS1...` ($2,300, anchor day 1):**
- Set `billing_cycle_anchor` = May 1, 2026 (Unix: 1777939200)
- Next charge: May 1, then 1st of every month going forward

**Sub `sub_1T6fyx...` ($3,800, anchor day 15):**
- Set `billing_cycle_anchor` = May 15, 2026 (Unix: 1779148800)
- Next charge: May 15, then 15th of every month going forward
- Note: the Apr 14 $3,800 charge already went through (still pending ACH), so the period from Apr 14 → May 15 is essentially "free extra month" — that's the cost of realigning without proration. Acceptable trade-off.

### Implementation

**Option A — One-off Stripe API calls now (recommended)**

I'll execute two `stripe.subscriptions.update` calls directly in default mode:
```
stripe.subscriptions.update('sub_1T5ZS1...', {
  billing_cycle_anchor: 1777939200,  // May 1, 2026
  proration_behavior: 'none',
});
stripe.subscriptions.update('sub_1T6fyx...', {
  billing_cycle_anchor: 1779148800,  // May 15, 2026
  proration_behavior: 'none',
});
```

After running, I'll also update `customer_subscriptions.next_billing_date` in your DB to reflect the new anchors so the dashboard shows the correct upcoming dates.

**Option B — Use the existing admin "First Billing Date" picker**

If your `EditSubscriptionDatesDialog` already supports re-anchoring (per memory `subscription-anchor-manual-override`), I can walk you through doing it manually for each sub. But the API approach is faster and avoids any edge cases.

### Files / changes

1. Run two Stripe API updates (no code file changes — direct API calls).
2. Update `customer_subscriptions.next_billing_date` for both rows to `2026-05-01` and `2026-05-15`.
3. Add audit log entries to `app_event_logs` recording the manual realignment.

No edge function or schema changes needed.

