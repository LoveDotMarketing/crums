

## Fix: Auto-Activate on Subscribe (Eliminate Separate Activate Step)

### Problem
When an admin creates a subscription, the system already creates the Stripe subscription and charges the deposit, but:
1. It does NOT apply the card surcharge to the deposit (activate-subscription does)
2. It does NOT create a `billing_history` record for the deposit (activate-subscription does)
3. When a billing anchor causes a $0 first invoice, the subscription shows as "active" but with no real payment — requiring the admin to press "Activate" to charge the first period

The user wants **Subscribe = Activate**. One click, deposit charged, first period charged if needed, done.

### Solution
Merge the activate-subscription logic into create-subscription so everything happens in one step.

### Changes

**1. `supabase/functions/create-subscription/index.ts`**

In the deposit charging block (lines 538-633):
- Add card surcharge logic (import `calculateCardSurcharge` from shared billing, detect if PM is card, adjust deposit amount) — matching what activate-subscription does at lines 277-296
- Create a `billing_history` record after the deposit is charged (matching activate-subscription lines 317-327)

After the Stripe subscription is created and deposit is handled, add a "first period safety net" block:
- Check if the subscription's first invoice was $0 (due to billing anchor + proration_behavior: "none")
- If so, create a standalone first-period invoice with all line items and charge it immediately (matching activate-subscription lines 342-462)
- Apply card surcharge if applicable
- Create a billing_history record for this charge too

**2. `src/pages/admin/Billing.tsx`**

After `create-subscription` returns successfully:
- Remove the need to show "Activate" button for newly created subscriptions
- The `isReadyToActivate` logic (line 1546) already excludes subs where `deposit_paid` is true and status is "active" — so if create-subscription sets these correctly, no Activate button will appear

The Activate button and `activate-subscription` function remain available as a fallback for edge cases (e.g., previously created subscriptions that weren't auto-activated, or retries after failures).

### Technical Detail

The key additions to `create-subscription/index.ts` in the deposit block:

```text
1. After resolving depositPaymentMethodId:
   - Retrieve PM info to detect card vs ACH
   - If card: apply calculateCardSurcharge() to adjust deposit amount
   
2. After paying deposit invoice:
   - Insert billing_history record with correct payment_method type

3. After subscription creation + deposit:
   - Check if subscription has any real payments via stripe.invoices.list
   - If no real payments found, create standalone first-period invoice
   - Apply card surcharge if card PM
   - Charge and record in billing_history
```

This is entirely within `create-subscription/index.ts` — no other edge function changes needed.

