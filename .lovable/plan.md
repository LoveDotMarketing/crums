

## Clean Up Abdul's (Azptrucking@gmail.com) Broken Stripe State

### Current State

**Two Stripe customers exist:**
- `cus_U4oBrNhek7Fs0K` — 1 open invoice ($1,400 deposit)
- `cus_U5sQ2ohTsvdzXt` — 3 open invoices ($1,400 + $1,000 + $1,400) + 1 active subscription (`sub_1TJeLH...`)

**Database:**
- 1 subscription record (`e62fa1b0`) pointing to `sub_1TJeLH...` with status "active"
- 1 subscription item (trailer 248088, status "ended", but trailer still marked "rented")
- 2 billing_history records both "pending" with stale invoice IDs
- Application still points to `cus_U5sQ2ohTsvdzXt` with a stale PM

**Problem:** All 4 invoices are "open" with no valid payment method. The Stripe subscription is "active" but can never collect. Nothing is voidable from the UI because they show as "incomplete."

### Cleanup Steps

**1. Void all 4 open invoices in Stripe**
Use the Stripe tool to void each invoice:
- `in_1TJeLILjIwiEGQIhBxO83Uuv` ($1,400)
- `in_1TJKcCLjIwiEGQIhiagYbkcY` ($1,000)
- `in_1TJKXkLjIwiEGQIhuHI2erQ2` ($1,400)
- `in_1THDZdLjIwiEGQIhAnYmlqnZ` ($1,400)
- `in_1TJe45LjIwiEGQIhtglnlTf3` ($1,400 on other customer)

**2. Cancel the Stripe subscription**
Cancel `sub_1TJeLHLjIwiEGQIh52Int6rL` immediately.

**3. Clean up database records**
Via migration:
- Delete the 2 billing_history records for subscription `e62fa1b0`
- Delete the subscription_items record
- Delete the customer_subscriptions record `e62fa1b0`
- Release trailer 248088: set status to "available", clear customer_id, set is_rented to false

**4. Reset payment setup**
Via migration:
- Set `payment_setup_status = 'pending'`, clear `stripe_payment_method_id` and `stripe_customer_id` on the application record

**5. Delete the duplicate Stripe customer**
Delete `cus_U5sQ2ohTsvdzXt` (the orphan with no valid PMs) so only `cus_U4oBrNhek7Fs0K` remains. Or vice versa — whichever one gets a fresh ACH link.

After cleanup, Abdul will need to redo ACH setup, then you can create a fresh subscription.

### Files Modified
| Target | Change |
|--------|--------|
| Stripe (via tools) | Void 5 invoices, cancel 1 subscription, delete 1 customer |
| Database (migration) | Delete billing_history, subscription_items, customer_subscriptions records; release trailer; reset application payment status |

