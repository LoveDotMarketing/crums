

## Code Review Report Assessment

I've reviewed the uploaded CRUMS Leasing Code Review Report against the **current state** of the codebase. Here's what's already been addressed and what still needs fixing.

---

### Already Fixed / Partially Mitigated

| Finding | Status | Evidence |
|---------|--------|----------|
| **Finding 3: No front-end double-click protection** | FIXED | `CreateSubscriptionDialog` line 1070: `disabled={createSubscriptionMutation.isPending}` |
| **Finding 3: No duplicate subscription check** | FIXED | Lines 110-136 of `create-subscription`: checks for existing active/pending/paused subscriptions and blocks conflicting trailer assignments |
| **`charge-customer` missing admin check** | FIXED | Lines 42-49: admin role verified |
| **`charge-customer` no ceiling** | FIXED | Line 57: `CHARGE_CEILING = 5000` and 10-min cooldown |
| **`charge-toll` missing admin check** | Previously fixed per earlier conversation |

---

### Still Open — Needs Fixing

#### 1. CRITICAL: Dual Deposit Charging Paths in `create-subscription`
**Path A** (lines 386-443): Deposit added as `add_invoice_items` on the subscription's first invoice.
**Path B** (lines 462-556): Safety-net standalone deposit invoice if subscription goes active with no open invoice.

Both paths CAN execute: Path A adds the deposit to the subscription invoice, and if Stripe auto-activates the subscription (e.g., $0 proration), Path B fires a second standalone deposit invoice. The `depositChargedDuringCreation` flag only tracks Path B, not Path A.

**Fix**: Remove Path A entirely. Use ONLY Path B (standalone deposit invoice) so deposit charging is always explicit and controlled. OR remove Path B and rely solely on Path A. Pick one.

#### 2. HIGH: `activate-subscription` Can Re-Charge Deposits
Lines 234-351: If `deposit_paid` is `false` and `depositAmount > 0`, it creates another standalone deposit invoice. This is correct as a check, BUT if `create-subscription` Path A already charged the deposit on the subscription's first invoice and didn't set `deposit_paid = true` in the DB (which it doesn't for Path A — only Path B sets `depositChargedDuringCreation`), then activate will charge the deposit again.

**Fix**: After removing one deposit path from `create-subscription`, ensure `deposit_paid` is set to `true` whenever a deposit is successfully included on any invoice. Add a Stripe idempotency key: `{subscription_id}_deposit`.

#### 3. MEDIUM: Semimonthly = Biweekly (26 vs 24 charges/year)
Line 261: `semimonthly: { interval: "week", interval_count: 2 }` — this is biweekly, not true semimonthly.

**Fix**: Rename the option to "biweekly" in the UI, or add a disclaimer. True semimonthly (1st & 15th) isn't natively supported by Stripe.

#### 4. MEDIUM: Cross-Customer Payment Method Resolution
`activate-subscription` lines 102-137: Searches up to 10 Stripe customers with the same email and can grab a payment method from a different customer. Lines 269-275 explicitly log "Charging deposit on alternate Stripe customer."

**Fix**: Remove the cross-customer fallback entirely. Only use payment methods attached to the subscription's own Stripe customer. If none found, throw an error telling admin to re-run ACH setup.

#### 5. MEDIUM: Duplicated `getDefaultRate` Logic
- `create-subscription` line 295: Dry Van = 700
- `modify-subscription` line 27: Dry Van = 700
- These match now, but there's no shared module. Any future drift will cause billing discrepancy.

**Fix**: Create `supabase/functions/_shared/billing.ts` with shared `getDefaultRate`, `intervalMap`, `calculateCardSurcharge`, and payment method resolution logic. Import from all edge functions.

#### 6. LOW: Inline Stripe Price Creation
Every subscription creation calls `stripe.prices.create()` per trailer. Thousands of one-off prices accumulate in Stripe.

**Fix**: Not urgent. Could cache prices by (rate + interval) but this is cosmetic.

---

### Implementation Plan

**Step 1: Consolidate deposit charging in `create-subscription`**
Remove Path A (the `add_invoice_items` deposit on the subscription). Keep only Path B (standalone deposit invoice). This eliminates the dual-charge risk entirely.

**Step 2: Add idempotency keys to deposit charges**
In both `create-subscription` and `activate-subscription`, add Stripe idempotency keys when creating deposit invoices: `idempotencyKey: {stripe_subscription_id}_deposit`.

**Step 3: Remove cross-customer payment method fallback**
In `activate-subscription`, delete the loop at lines 102-137 that searches other Stripe customers. Only use methods on the subscription's own Stripe customer + the stored `stripe_payment_method_id` from the application.

**Step 4: Create shared billing utilities**
Create `supabase/functions/_shared/billing.ts` with `getDefaultRate`, `intervalMap`, and `calculateCardSurcharge`. Update `create-subscription`, `activate-subscription`, `modify-subscription`, and `charge-customer` to import from it.

**Step 5: Rename semimonthly to biweekly**
Update the UI label and any references to clarify this is every-2-weeks billing, not twice-per-month.

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/create-subscription/index.ts` | Remove Path A deposit, add idempotency key to Path B |
| `supabase/functions/activate-subscription/index.ts` | Add idempotency key to deposit invoice, remove cross-customer PM fallback |
| `supabase/functions/_shared/billing.ts` | NEW — shared `getDefaultRate`, `intervalMap`, `calculateCardSurcharge` |
| `supabase/functions/modify-subscription/index.ts` | Import shared `getDefaultRate` |
| `supabase/functions/charge-customer/index.ts` | Import shared `calculateCardSurcharge` |
| `src/components/admin/CreateSubscriptionDialog.tsx` | Rename "semimonthly" label to "biweekly" |

