

## Fix: Stripe Customer Resolution Must Verify Payment Methods Exist

### Problem
Abdul's account has **two Stripe customers** for the same email:
- `cus_U4oBrNhek7Fs0K` — stored in `customer_applications`, but has **no payment methods** (the old PM was detached and is permanently unusable)
- `cus_U5sQ2ohTsvdzXt` — newer customer created during ACH re-setup, likely has the **active payment method**

The previous fix told the system to prefer the `customer_applications` record, but that record points to the old empty customer. The deposit invoice was created on that customer with no PM → stuck as "Incomplete."

### Immediate Cleanup (Manual in Stripe)
1. **Cancel** old subscription `sub_1TJKcB` on `cus_U5sQ2ohTsvdzXt` and void its 3 open invoices ($3,800 total)
2. **Void** the incomplete deposit invoice `in_1TJe45` ($1,400) on `cus_U4oBrNhek7Fs0K`
3. **Cancel** subscription `sub_1TJe43` on `cus_U4oBrNhek7Fs0K`
4. Clean up corresponding database records

### Code Fix: `supabase/functions/create-subscription/index.ts`

**Change the Stripe customer resolution logic** (lines 243–292) to verify the chosen customer actually has payment methods attached, not just that the ID exists in Stripe:

```text
Current flow:
  1. Get stripe_customer_id from customer_applications
  2. Verify customer exists in Stripe → use it ✓
  3. Fallback: search by email

Fixed flow:
  1. Get stripe_customer_id from customer_applications
  2. Verify customer exists AND has ≥1 payment method → use it
  3. If no PM: search ALL Stripe customers by email
  4. Pick the one that HAS payment methods attached
  5. Update customer_applications with the correct stripe_customer_id
```

Specifically:
- After retrieving `appForStripe.stripe_customer_id`, list payment methods on that customer (`stripe.paymentMethods.list`)
- If no PMs found, fall through to email search
- In the email search fallback, iterate results and pick the customer that has PMs
- After resolving the correct customer, **update** `customer_applications.stripe_customer_id` so future operations use the right one

Also update the **deposit payment method resolution** (lines 478–522):
- After listing ACH methods on the resolved customer, also check for card methods as fallback
- Remove the dead-code path that tries to re-attach the stored PM (it's permanently unusable once detached)

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/create-subscription/index.ts` | Add PM verification to customer resolution; update app record with correct customer ID; simplify deposit PM lookup |

