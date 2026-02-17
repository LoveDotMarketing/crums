

## Stripe Toll Charging -- What's Missing and How to Fix It

### The Problem
Right now, tolls are **only tracked in the database** -- there is no connection to Stripe whatsoever. When you add a toll and it shows "pending," that just means a record was inserted into the `tolls` table. Nothing happens on Stripe's side.

### What We'll Build
A complete toll-to-Stripe charging pipeline:

1. **New backend function**: `charge-toll` -- Creates a Stripe Invoice for the toll amount against the customer's existing ACH payment method, then auto-finalizes and attempts payment
2. **"Charge via Stripe" button** on the admin Tolls page for each pending/overdue toll
3. **Automatic status sync** -- Updates the toll record to "paid" when Stripe confirms payment
4. **Tracking columns** -- Add `stripe_invoice_id` and `stripe_payment_intent_id` to the `tolls` table so you can trace every charge

### How It Works

```text
Admin clicks "Charge via Stripe" on a pending toll
       |
       v
Edge function: charge-toll
  1. Looks up customer's stripe_customer_id from customer_subscriptions
  2. Creates a Stripe InvoiceItem ($65.00, description: "Toll - DMB Delaware Memorial Br - 1/19/2026")
  3. Creates a Stripe Invoice for that customer
  4. Finalizes the invoice (triggers auto-charge via default ACH payment method)
  5. Saves stripe_invoice_id back to the tolls table
  6. Updates toll status to "paid" if payment succeeds, or "pending" if payment is processing
       |
       v
Toll shows as "paid" in dashboard + visible in Stripe
```

### Database Changes

Add two columns to the `tolls` table:
- `stripe_invoice_id` (text, nullable) -- Links to the Stripe invoice
- `stripe_payment_intent_id` (text, nullable) -- Links to the Stripe payment intent for tracking

### New Backend Function: `charge-toll`

**Input**: `{ toll_id: string }`

**Logic**:
1. Fetch the toll record (amount, customer_id, location, date, authority)
2. Look up the customer's `stripe_customer_id` from `customer_subscriptions`
3. If no Stripe customer exists, return an error ("Customer has no linked payment method")
4. Create a Stripe Invoice Item with the toll amount and description
5. Create and finalize a Stripe Invoice (auto-charges the default payment method)
6. Update the `tolls` record with `stripe_invoice_id`, `stripe_payment_intent_id`, `status`, and `payment_date`
7. Return success/failure

### UI Changes (Tolls.tsx)

**For each pending/overdue toll row**, add a "Charge via Stripe" button next to the existing "Mark Paid" button:
- Shows a loading spinner while processing
- Disables if the customer has no Stripe account linked
- On success: toast "Toll charged successfully via Stripe" and refresh the list
- On failure: toast with specific error (e.g., "Customer has no linked payment method")

### Files to Create
- `supabase/functions/charge-toll/index.ts` -- New edge function to create Stripe invoice and charge

### Files to Modify
- `src/pages/admin/Tolls.tsx` -- Add "Charge via Stripe" button per toll row
- Database migration -- Add `stripe_invoice_id` and `stripe_payment_intent_id` columns to `tolls`

### What About Future Tolls?
Once this is built, every new toll you add can be immediately charged by clicking the button. You could also optionally enable auto-charging (charge on creation) in the future, but for now the manual button gives you control over when to bill the customer.

### Prerequisites Already Met
- Stripe secret key is configured
- Customers have `stripe_customer_id` stored in `customer_subscriptions`
- ACH payment methods are already linked via the existing onboarding flow
- No new API keys or secrets needed

