

## Auto-Reset Failed ACH Setup

**Problem:** When a customer's ACH setup fails (they don't complete penny verification, bank session times out, etc.), `payment_setup_status` stays stuck at `'sent'`. The customer can't retry without manual admin intervention.

**Solution:** Two changes that work together to auto-recover:

### 1. Edge function: `check-payment-status/index.ts`
When the function detects `payment_setup_status = 'sent'` but there are **zero payment methods** on the Stripe customer, automatically reset the status to `'pending'` in the database. This means every time the customer visits the Payment Setup page (or tabs back), the system self-heals.

**Key logic addition** (around line 101-113, where it returns "no payment methods"):
- If `application.payment_setup_status === 'sent'` and no payment methods exist → update the application to `payment_setup_status = 'pending'` and clear `stripe_payment_method_id`
- Return `paymentSetupStatus: 'pending'` so the UI shows the setup button again

### 2. Customer page: `src/pages/customer/PaymentSetup.tsx`
No UI changes needed — the page already shows the setup button when `paymentSetupStatus` is not `'completed'` and `hasPaymentMethod` is false. The auto-reset in the edge function handles the state transition.

### Files changed
- `supabase/functions/check-payment-status/index.ts` — add auto-reset logic when status is `'sent'` but no payment methods exist on Stripe

