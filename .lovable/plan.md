

## Fix Gerald Porter's Billing Date

### What Happened
The subscription was created April 2 with a Friday weekly anchor, so Stripe tried to charge $1,666 immediately. The payment failed. Gerald's billing should start on the **15th** instead.

### What Needs to Happen

**Step 1: Void the failed invoice in Stripe**
Use the void-charge edge function or Stripe API to void invoice `in_1THvOSLjIwiEGQIhyZ3guS5E` ($1,666) so it stops attempting collection.

**Step 2: Update the Stripe subscription's billing_cycle_anchor**
Use `stripe.subscriptions.update()` to change the `billing_cycle_anchor` to April 15 (Unix timestamp). For weekly billing, this resets the recurring cycle to start from the 15th. Since Stripe doesn't allow changing `billing_cycle_anchor` after creation on an existing subscription, we may need to **cancel and recreate** the subscription with the correct anchor.

**Step 3: Update local database**
Update `subscription_items` to set `billing_anchor_day` to the correct value for the new schedule.

### Implementation

| File | Change |
|------|--------|
| No code changes needed | This is a data fix — void the invoice via Stripe API and recreate the subscription with the correct anchor date |

### Preventive Improvement (Code Change)
Add a **"First billing date"** date picker to `CreateSubscriptionDialog.tsx` so admins can explicitly choose when billing starts, rather than relying solely on anchor day math. This makes the intent explicit and prevents similar misconfigurations.

| File | Change |
|------|--------|
| `src/components/admin/CreateSubscriptionDialog.tsx` | Add optional "First Billing Date" date picker that overrides the calculated anchor timestamp |
| `supabase/functions/create-subscription/index.ts` | Accept `firstBillingDate` param and use it directly as `billing_cycle_anchor` when provided |

### Technical Notes
- Stripe does not allow updating `billing_cycle_anchor` on existing subscriptions — the subscription must be canceled and recreated
- The void must happen first to prevent further collection attempts
- Only trailer 144547 (active, $833/week) needs to be on the new subscription; 606945 is already ended
- The "First Billing Date" picker gives admins explicit control and removes ambiguity between "anchor day" (abstract) and "when does billing actually start" (concrete)

