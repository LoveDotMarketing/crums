
Deep-dive outcome

I reviewed the full subscription-creation workflow, not just Stevie’s latest Stripe error. The recent delayed-start fix is necessary, but it is not the only risk still in the flow. The biggest remaining problems are workflow mismatches between create-subscription, split billing, activation, and sync behavior.

Highest-risk issues still in the workflow

1. Grouping bug in create-subscription
- Trailers are grouped only by anchor day.
- A weekly Friday trailer (anchor 5) can be merged with a monthly day-5 trailer.
- The group billing cycle is then taken from whichever trailer is first.
- Result: wrong Stripe interval, wrong billing, wrong local records.

2. Wrong local billing_cycle on split groups
- Each customer_subscriptions row is saved with the global billingCycle, not the actual group cycle.
- A split weekly/monthly customer can be correct in Stripe but wrong in the app and later edits.

3. firstBillingDate currently applies to every group
- With split billing, one global firstBillingDate gets forced onto all groups.
- That can destroy 1st/15th or weekly/monthly separation.

4. Weekly anchor validation is unsafe
- The UI still lets admins pick monthly-style anchor numbers even for weekly billing.
- The backend silently drops invalid weekly anchors instead of rejecting them.
- That makes start dates unpredictable.

5. Repeat-customer lookup is brittle
- Several customer_applications lookups still use maybeSingle().
- If a customer has multiple application rows, the flow can fail even if the newest row is valid.

6. No full rollback after Stripe success
- Deposit rollback exists only if the deposit charge fails.
- If Stripe succeeds but a later DB insert/update fails, the system can leave:
  - a live Stripe subscription
  - a charged deposit
  - partial or missing local records
  - trailers stuck rented

7. Activation/sync still think in “old flow” terms
- Standalone deposit and first-period invoices should be treated as authoritative via metadata.
- Right now some logic still reasons from subscription invoices only, or from amount matching.
- That leaves room for false “Activate” states or missed confirmations.

Implementation plan

1. Rebuild create-subscription around a normalized billing-group model
- Resolve each trailer into:
  - effective billing cycle
  - effective anchor
  - effective rate
- Group by cycle + anchor, not anchor alone.
- Save the real group billing cycle on each created customer_subscriptions row.
- Keep per-trailer billing metadata aligned with the created group.

2. Add strict validation before Stripe is called
- Validate request fields up front.
- Include month_to_month in the accepted subscription types.
- Reject invalid weekly anchor values instead of silently falling back.
- If multiple billing groups exist, block a single global firstBillingDate for now.
- Keep delayed-start logic for single-group subscriptions like Stevie.

3. Harden repeat-customer resolution
- Replace brittle maybeSingle() application lookups with “latest valid row wins”.
- Do this for both user_id and customer_id lookup paths.
- Keep the current Stripe customer/payment-method healing, but make the DB side deterministic.

4. Add full compensation/rollback logic
- Track every Stripe object created during the request.
- If any later local step fails:
  - cancel created Stripe subscriptions
  - void/cancel standalone invoices when possible
  - release any trailers already marked rented
  - avoid leaving partial local state
- Return one precise admin-facing error.

5. Align activation and sync with the new auto-activation architecture
- In activate-subscription, treat standalone invoices tied by metadata as real payments so it cannot create an extra charge for an already-auto-created subscription.
- In sync-payments, confirm deposits using invoice metadata like type=security_deposit instead of amount equality alone.
- Keep next_billing_date and payment status sync, but make it metadata-aware.

6. Fix admin UI constraints and review copy
- Separate weekly anchor choices from monthly-style anchor days.
- Make the review state explain the actual mode:
  - deposit charged now
  - recurring start date
  - whether one or multiple subscriptions will be created
- If split billing is selected, summarize per group instead of pretending it is one schedule.

7. Clean up canceled-row reuse
- When reusing a canceled subscription row, overwrite or clear stale values that should not carry forward from an old contract.

Verification pass after patching

1. Stevie case
- Monthly
- firstBillingDate = May 15
- deposit charges immediately
- recurring starts May 15
- no billing_cycle_anchor in delayed mode

2. Near-date monthly case
- direct anchor mode still works
- no duplicate first-period charge

3. Split monthly case
- one trailer on 1st, one on 15th
- two local subscriptions created
- each row stores the correct billing cycle

4. Mixed-cycle case
- one weekly Friday trailer, one monthly trailer
- separate groups
- no cycle bleed

5. Repeat-customer case
- multiple application rows present
- newest valid Stripe linkage is used

6. Failure-path case
- force a local failure after Stripe creation
- confirm rollback leaves no live bad state

Files to update
- supabase/functions/create-subscription/index.ts
- src/components/admin/CreateSubscriptionDialog.tsx
- supabase/functions/activate-subscription/index.ts
- supabase/functions/sync-payments/index.ts

Priority order
1. create-subscription grouping + validation + rollback
2. activate/sync metadata-aware hardening
3. admin UI constraints/copy

Expected result
- Stevie’s case should work.
- Split billing and mixed schedules stop producing wrong subscriptions.
- Repeat customers stop failing due to duplicate application rows.
- Admins are protected from partial Stripe/local mismatches and extra charges.
