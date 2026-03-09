

# Add Credit Card Payment Option with Fee Passthrough

## Overview
Add credit card as an alternative payment method alongside ACH, with Stripe's processing fees passed through to the customer. Customers can switch between ACH and credit card at any time from their dashboard.

## Fee Calculation
Stripe's credit card fee: **2.9% + $0.30 per transaction**. To pass through correctly, we use the reverse formula:
```
adjusted_amount = (base_amount + 0.30) / (1 - 0.029)
surcharge = adjusted_amount - base_amount
```
For a $700 payment: surcharge ≈ $20.99 → customer pays $720.99.

## Changes

### 1. Database: Add `payment_method_type` column to `customer_applications`
Track whether the customer's preferred payment method is `ach` or `card`:
```sql
ALTER TABLE customer_applications ADD COLUMN payment_method_type text DEFAULT 'ach';
```

### 2. Edge Function: `create-ach-setup/index.ts`
- Accept a `paymentMethodType` parameter (`"ach"` or `"card"`)
- When `"card"`, create a SetupIntent with `payment_method_types: ["card"]` instead of `["us_bank_account"]`
- Return the same `clientSecret` / `publishableKey` structure

### 3. Edge Function: `confirm-ach-setup/index.ts`
- Accept `paymentMethodType` and store it in `customer_applications.payment_method_type`
- For card, retrieve the card PM and set as default (same pattern as ACH)

### 4. Edge Function: `check-payment-status/index.ts`
- Also check for `card` type payment methods on the Stripe customer (not just `us_bank_account`)
- Return `paymentMethodType: "ach" | "card"` and card details (brand, last4) when applicable

### 5. Edge Function: `activate-subscription/index.ts`
- In `resolveAchPaymentMethodId`, also search for `card` payment methods as fallback
- When charging with a card PM, calculate and add the processing fee surcharge to the deposit amount

### 6. Edge Function: `create-subscription/index.ts`
- Store `payment_method_type` on the subscription metadata
- When payment method is `card`, adjust the Stripe price amounts to include the 2.9% + $0.30 surcharge per trailer
- ACH guard: also accept `card` payment methods (rename guard to "payment method guard")

### 7. Edge Function: `charge-customer/index.ts`
- Detect if customer's default PM is a card; if so, add surcharge to the invoice item amount
- Log the surcharge separately

### 8. Edge Function: `process-billing/index.ts` (if it creates invoices)
- Apply same surcharge logic for card customers on recurring billing

### 9. Customer UI: `PaymentSetup.tsx`
- Add a payment method type selector (ACH vs Credit Card) above the setup button
- ACH: existing flow (Financial Connections / bank linking)
- Credit Card: use `stripe.confirmCardSetup()` with Stripe Elements (CardElement)
- Show fee disclosure: "Credit card payments include a 2.9% + $0.30 processing fee" with example calculation
- Update "What is ACH?" section to compare ACH vs Card fees
- After setup: show card details (Visa ••••4242) or bank details based on type

### 10. Customer UI: Payment method switching
- On the success/connected state, add a "Switch to Credit Card" or "Switch to ACH" button
- This resets `payment_setup_status` to `pending` and allows re-setup with the other method
- Edge function handles detaching old PM and attaching new one

### 11. Admin UI: `Applications.tsx`
- Show badge indicating payment method type (ACH vs Card) next to the status
- ACH setup dialog: add option to set up card instead

### 12. Admin: `Billing.tsx` / billing history display
- Show `payment_method` as "ACH" or "Card" with appropriate icons in the billing ledger
- Display surcharge amount when applicable

### Files to update (12 total)
- **Database migration** — 1 ALTER TABLE
- `supabase/functions/create-ach-setup/index.ts` — support card SetupIntent
- `supabase/functions/confirm-ach-setup/index.ts` — store payment method type
- `supabase/functions/check-payment-status/index.ts` — check card PMs too
- `supabase/functions/activate-subscription/index.ts` — resolve card PMs, add surcharge
- `supabase/functions/create-subscription/index.ts` — surcharge on card rates, relax ACH guard
- `supabase/functions/charge-customer/index.ts` — surcharge for card customers
- `src/pages/customer/PaymentSetup.tsx` — ACH/Card selector, Card Elements, fee disclosure, switch button
- `src/components/admin/AdminAchSetupDialog.tsx` — support card setup option
- `src/pages/admin/Applications.tsx` — payment method type badge
- `src/pages/admin/Billing.tsx` — card vs ACH display in ledger

