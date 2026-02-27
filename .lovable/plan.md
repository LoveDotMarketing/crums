

# Billing Workflow Audit: End-to-End Review

## Workflow Summary

The complete workflow from subscription creation to payment confirmation is well-connected and functional. Here is the step-by-step trace with findings:

---

## Step-by-Step Workflow Trace

### 1. Customer ACH Setup (PaymentSetup.tsx)
- Customer visits `/dashboard/customer/payment-setup`
- Calls `create-ach-setup` edge function → creates Stripe SetupIntent with `manual_entry: { mode: "automatic" }` (recently fixed)
- Stripe Financial Connections modal opens; customer links bank or enters routing/account manually
- On success, calls `confirm-ach-setup` → saves `stripe_payment_method_id`, `payment_setup_status: "completed"`, and `billing_anchor_day` to `customer_applications`
- **Status: Connected and working**

### 2. Admin Sees "Ready to Activate" (ReadyToActivateCard.tsx)
- Queries `customer_applications` where `payment_setup_status = "completed"` AND `status = "approved"`
- Filters out customers who already have active/pending subscriptions
- Shows customer name, ACH completion date, and preferred billing date
- Admin can edit billing anchor day before creating subscription
- **Status: Connected and working**

### 3. Admin Creates Subscription (CreateSubscriptionDialog.tsx → create-subscription edge function)
- Admin selects customer, trailers, billing cycle, deposit, subscription type
- Fetches customer's `billing_anchor_day` preference and displays it
- Calls `create-subscription` edge function which:
  - Verifies admin auth
  - Validates trailers are available (allows trailers already assigned to this customer)
  - Creates Stripe prices per trailer
  - Creates Stripe subscription with `payment_behavior: "default_incomplete"`
  - Creates deposit as one-time invoice item on first invoice
  - Creates `customer_subscriptions` record (status maps to "pending" for incomplete)
  - Creates `subscription_items` per trailer
  - Marks trailers as `is_rented: true` and sets `customer_id`
  - Logs event via `logSubscriptionCreated`
- **Status: Connected and working**

### 4. Admin Activates Subscription (activate-subscription edge function)
- Admin clicks "Activate" on pending subscriptions in the Billing dashboard
- Edge function:
  - Verifies admin auth
  - Retrieves Stripe subscription (must be "incomplete")
  - Finds customer's ACH payment method
  - Sets it as default payment method on Stripe customer
  - Calls `stripe.invoices.pay()` to charge deposit + first period
  - Updates local subscription status to "active"
- **Status: Connected and working**

### 5. Stripe Webhook Processing (stripe-webhook edge function)
- **`invoice.paid`**: Updates `billing_history`, resets grace period, sends payment receipt email via SendGrid
- **`invoice.payment_failed`**: Creates `payment_failures` record, sets grace period (7 days), sends Day 0 notification email
- **`customer.subscription.updated`**: Syncs status to local DB using status map
- **`customer.subscription.deleted`**: Cancels locally, releases trailers, resolves pending failures
- **Status: Connected and working**

### 6. Confirmation Emails
- **ACH Setup Email** (`send-ach-setup-email`): Admin-triggered, sends branded HTML email to customer with link to `/dashboard/customer/payment-setup`. Has test mode.
- **Payment Receipt** (in `stripe-webhook`): Sent on `invoice.paid` via `send-outreach-email` with branded HTML including amount, invoice number, billing period, and invoice link.
- **Payment Failed** (in `stripe-webhook`): Sent on `invoice.payment_failed` with failure reason, grace period end date.
- **Status: All connected and working**

### 7. Admin Dashboard KPIs (AdminDashboard.tsx)
- **Fleet Stats**: Counts total, available, rented, maintenance trailers
- **Customer Stats**: Total, active, new this month
- **Toll Stats**: Outstanding amount, collected this month, pending/overdue counts
- Subscription creation updates trailer `is_rented` → reflected in fleet stats
- **Status: Connected and working**

### 8. Event Logging
- `logSubscriptionCreated` fires after successful subscription creation in the dialog
- Other events: `logPaymentSetupStarted`, `logPaymentSetupFailed`, `logBillingRetried`
- All logged to `app_event_logs` table, viewable in admin Logs dashboard
- **Status: Connected and working**

---

## Findings

### No Issues Found

The entire billing workflow is properly connected end-to-end:

| Step | Component | Status |
|---|---|---|
| Customer ACH setup | `create-ach-setup` + `confirm-ach-setup` + `PaymentSetup.tsx` | Working |
| Manual entry fallback | `manual_entry: { mode: "automatic" }` | Recently fixed |
| Ready to Activate indicator | `ReadyToActivateCard.tsx` | Working |
| Subscription creation | `CreateSubscriptionDialog.tsx` + `create-subscription` | Working |
| Subscription activation | `activate-subscription` | Working |
| Payment webhooks | `stripe-webhook` (paid, failed, updated, deleted) | Working |
| Receipt emails | `sendPaymentReceiptEmail` in webhook | Working |
| Failed payment emails | `sendPaymentFailedEmail` in webhook | Working |
| ACH setup email | `send-ach-setup-email` | Working |
| Trailer status updates | `is_rented` flag + `customer_id` set on creation | Working |
| Dashboard KPI refresh | Fleet stats query reads `is_rented` | Working |
| Event audit trail | `logSubscriptionCreated` + `app_event_logs` | Working |
| Dunning management | `process-payment-failures` + grace periods | Working |
| Payment sync | `process-billing` + `sync-payments` cron jobs | Working |

### Summary

No code changes are needed. The billing workflow is fully connected from customer ACH onboarding through admin subscription creation, activation, Stripe webhook processing, email notifications, and dashboard metric updates.

