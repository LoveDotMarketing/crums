
## Completed: Comprehensive subscription workflow fix

### Changes made

1. **create-subscription/index.ts** — full rewrite with:
   - Grouping by `cycle + anchor` (not anchor alone) to prevent weekly/monthly collisions
   - Each `customer_subscriptions` row stores its group's actual billing cycle
   - Strict input validation (billing cycles, sub types, weekly anchor ranges)
   - Blocks global `firstBillingDate` for multi-group setups
   - Hardened repeat-customer resolution (order+limit instead of maybeSingle)
   - Full rollback on failure: cancels Stripe subscriptions, voids invoices, releases trailers
   - Clears stale values (grace periods, failed counts) when reusing canceled rows
   - Delayed-start mode omits `billing_cycle_anchor` when using `trial_end`

2. **activate-subscription/index.ts** — metadata-aware payment check:
   - Checks standalone invoices (deposits, first-period) via `metadata.subscription_id`
   - Prevents false "no real payment" detection for auto-activated subscriptions

3. **sync-payments/index.ts** — metadata-aware deposit confirmation:
   - Identifies deposits via `metadata.type = "security_deposit"` first
   - Falls back to amount matching only when metadata is absent

4. **CreateSubscriptionDialog.tsx** — UI hardening:
   - All `maybeSingle()` calls replaced with `order+limit` for repeat customers
   - Review summary shows explicit delayed-start messaging
   - Clarifies "deposit charges now, recurring starts on [date]"
