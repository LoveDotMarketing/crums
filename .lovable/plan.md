

## Fix Ground Link Double Billing

**Root cause:** There are 3 Stripe subscriptions for Ground Link but only 2 should exist. Subscription `sub_1T6fduLjIwiEGQIhq7hxoreX` (database ID `c83102db`) is a duplicate of the 15th-of-month subscription — it has no active equipment items in the database but is still live in Stripe, causing a second $3,800 charge.

**Correct billing:**
- 1st of month: $2,300 (sub `c232ab1a`) — 3 trailers
- 15th of month: $3,800 (sub `81046ac5`) — 5 trailers

### Steps

1. **Cancel the duplicate Stripe subscription** `sub_1T6fduLjIwiEGQIhq7hxoreX` immediately so it stops billing
2. **Update the local database record** — set subscription `c83102db` status to `canceled` so it no longer appears as active
3. **You handle the refund** for the extra $3,800 charge directly in Stripe

### Files changed
- No code changes needed — this is a data fix using Stripe API + database migration

