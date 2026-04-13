

## Plan: Improve Billing Audit Logging & Fix ACH Void Handling

### Problem Summary
1. The `create-subscription` function generates deposit + first-period charges but writes **zero** audit log entries to `app_event_logs`
2. The `void-charge` function can't handle ACH payments in `processing` status gracefully
3. No way to trace which admin created a subscription or triggered charges

### Changes

#### 1. Add audit logging to `create-subscription` (supabase/functions/create-subscription/index.ts)
- After subscription creation succeeds, insert an `app_event_logs` entry with:
  - `event_type: "subscription_created"`
  - `user_id` and `user_email` of the admin who created it
  - `metadata` containing: customer_id, customer email, trailer numbers, deposit amount, first-period amount, stripe_subscription_id, stripe_invoice_ids for both deposit and first-period charges
- This ensures every subscription creation is traceable to a specific admin

#### 2. Add audit logging for deposit and first-period charges in `create-subscription`
- After the deposit invoice is charged (~line 632), insert a `customer_charged` event with deposit details
- After the first-period invoice is charged (~line 852), insert a `customer_charged` event with first-period details
- Both entries include the admin's user_id/email so you always know who triggered it

#### 3. Improve `void-charge` to handle ACH processing gracefully (supabase/functions/void-charge/index.ts)
- When an invoice has a payment_intent in `processing` status, return a clear error message: "This ACH payment is still processing (takes 4-5 business days). You can void it after it settles, or wait for it to fail. If it succeeds, use a refund instead."
- Instead of the generic Stripe error, give actionable guidance

#### 4. Add admin identity to `charge-customer` metadata
- The `charge-customer` function already logs to `app_event_logs` but doesn't include the admin's email in the metadata — add `admin_email` and `admin_id` fields to the metadata object

### Files Modified
- `supabase/functions/create-subscription/index.ts` — add 3 audit log inserts (subscription created, deposit charged, first-period charged)
- `supabase/functions/void-charge/index.ts` — better error message for ACH processing state
- `supabase/functions/charge-customer/index.ts` — add admin identity to metadata

### What This Solves
- Every subscription creation will show who did it, what trailers, what amounts
- Every auto-generated charge (deposit + first rent) will be traceable
- Void failures on ACH will give clear guidance instead of cryptic Stripe errors
- The "who charged $800?" question will never happen again

