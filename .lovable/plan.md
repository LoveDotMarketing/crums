

# Add One-Time Charge Feature

Create a reusable "Charge Customer" capability that lets admins apply ad-hoc one-time charges (missed payments, fees, adjustments) to any customer with an existing Stripe/ACH setup.

## Changes

### 1. New Edge Function: `supabase/functions/charge-customer/index.ts`
- Accepts: `customer_id`, `amount`, `description` (free text)
- Looks up `stripe_customer_id` from `customer_subscriptions` (same pattern as `charge-toll`)
- Creates a Stripe Invoice Item → Invoice → Finalizes → Auto-charges ACH
- Returns invoice ID, payment intent ID, and status
- Auth: JWT-verified, admin role required

### 2. New Dialog Component: `src/components/admin/ChargeCustomerDialog.tsx`
- Trigger: "Charge" button (with DollarSign icon)
- Fields: Amount (number input), Description/Reason (text input with common presets like "Missed Payment", "Late Fee - $150", "ACH Decline Fee - $100", or custom)
- On submit: calls `supabase.functions.invoke('charge-customer')`
- Shows success/error toast with invoice details

### 3. Add Charge Button to Admin UI
- **Customer Detail page** (`CustomerDetail.tsx`): Add a "Charge" button in the billing/subscription tab area
- **Billing page** (`Billing.tsx`): Add charge action in the subscription row actions dropdown

### 4. Config: `supabase/config.toml`
- Add `[functions.charge-customer]` with `verify_jwt = false` (validate in code)

