

## Fix: Payment Method Verification is Broken at Two Levels

### Root Cause Analysis

The logs tell the full story of what happened at **Apr 7, 6:27 PM**:

```text
1. Guard check (line 183): DB has stripe_payment_method_id = pm_1TJIqP...
   → PASSES (but pm_1TJIqP was detached/destroyed during previous cleanup!)

2. Stripe customer resolution:
   - cus_U4oBrNhek7Fs0K → NO payment methods ✗
   - Email search finds cus_U5sQ2ohTsvdzXt → NO payment methods ✗
   - Falls through to "Using first Stripe customer (no PMs found)" → CONTINUES ANYWAY

3. Subscription created with payment_behavior: "default_incomplete"
   → Stripe marks it "Incomplete" because no PM can pay the first invoice

4. Deposit invoice finalized → stripe.invoices.pay() called without a PM
   → Error: "no default_payment_method set"
   → Caught silently, logged as WARNING, function returns success
```

**Three bugs working together:**

| Bug | Location | Problem |
|-----|----------|---------|
| **Stale guard** | Lines 166-206 | Checks if `stripe_payment_method_id` exists in the **database** — never verifies it's actually valid in Stripe |
| **No hard stop** | Lines 302-318 | When zero Stripe customers have PMs, proceeds anyway instead of failing |
| **Silent failure** | Lines 577-582 | Deposit charge failure is caught and swallowed — function returns `success: true` even though nothing was charged |

### Solution

**1. Replace the DB-only guard with a real Stripe verification** (lines 166-206)

Instead of checking if `customer_applications.stripe_payment_method_id` is non-null, retrieve the actual PM from Stripe and verify it's still attached. If the stored PM is dead:
- Auto-reset `payment_setup_status` to `"pending"` and clear the stale PM ID
- Throw an error telling admin to re-do payment setup

**2. Hard-fail when no Stripe customer has payment methods** (lines 302-318)

When the email search finds customers but none have PMs, do NOT fall through to "use first customer." Instead, throw a clear error: *"No valid payment method found in Stripe. Customer needs to re-complete ACH/card setup."*

Also auto-reset the `payment_setup_status` to `"pending"` so the admin dashboard reflects reality.

**3. Make deposit failure a hard error** (lines 577-582)

If the deposit invoice payment fails due to missing PM, this is not a recoverable situation — the entire subscription should fail. Change the catch block to re-throw the error instead of swallowing it. The subscription and trailer assignments should be rolled back (or at minimum, the function should return an error status).

**4. Also update `confirm-ach-setup` to store `stripe_customer_id`** (lines 170-179)

The confirm function updates `stripe_payment_method_id` and `payment_method_type` but does NOT store the `stripe_customer_id` that the PM is attached to. This means the create-subscription function has to re-discover the customer every time via a multi-step lookup that can pick the wrong one. Store the customer ID at confirmation time to eliminate ambiguity.

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/create-subscription/index.ts` | Verify PM in Stripe (not just DB), hard-fail when no PMs exist, make deposit failure fatal, auto-reset stale payment status |
| `supabase/functions/confirm-ach-setup/index.ts` | Store `stripe_customer_id` alongside PM ID during confirmation |

