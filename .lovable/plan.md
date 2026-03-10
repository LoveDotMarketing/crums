

# Fix ACH Setup for Bahram Nabizada (zitruckingteamllc@gmail.com)

## Diagnosis

The customer's application record shows:
- `stripe_customer_id`: `cus_U4kPrwJVKqaaln` (Stripe customer exists)
- `stripe_payment_method_id`: **null** (no bank linked)
- `payment_setup_status`: **"sent"** (setup was initiated but never completed)
- `customer_id`: **null** (application not linked to customer record `9a5cbc3b-...`)

The customer started the ACH flow but never finished connecting their bank. The "sent" status prevents the UI from showing the setup button again.

## Fix

### 1. Database patch — reset payment status and link customer record
Run a single update on `customer_applications` to:
- Set `payment_setup_status` back to `null` so the "Link Bank Account" button reappears
- Link `customer_id` to the correct customer record (`9a5cbc3b-04b5-4292-b7ff-0213b7d73bdf`)

### 2. No code changes needed
The existing flow handles re-setup correctly once the status is cleared. The customer can then click "Link Bank Account" again and complete the Stripe Financial Connections modal.

