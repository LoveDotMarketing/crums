

## Plan: Add Admin Audit Logging to Billing Actions

### Problem
The ChargeCustomerDialog and billing retry flow don't log which admin performed the action. The existing `eventLogger.ts` helpers exist but aren't wired into all billing flows.

### Changes

**1. `src/components/admin/ChargeCustomerDialog.tsx`**
- Import `logAdminAction` from `@/lib/eventLogger`
- After successful charge (line 83), log: `logAdminAction("customer_charged", \`Charged $\${amount} to \${customerName}\`, { customer_id, amount, description, stripe_invoice_id, payment_method })`

**2. `src/pages/admin/Billing.tsx`**
- Import `logBillingRetried` from `@/lib/eventLogger`
- After successful retry (line 615), log: `logBillingRetried(failure customer name or ID, failure amount)`

**3. `supabase/functions/charge-customer/index.ts`**
- After successful charge, insert an audit record into `app_event_logs` with the admin's `user_id`, event type `"customer_charged"`, and metadata (customer_id, amount, stripe_invoice_id, payment_method type)
- This provides a server-side audit trail independent of the client

### What This Covers
- One-time charges (ChargeCustomerDialog) — client + server logging
- Payment retries (Billing.tsx) — client logging
- Subscription creation already logs via `logSubscriptionCreated`
- Customer creation already logs via `logCustomerCreated`

### Files
| File | Action |
|------|--------|
| `src/components/admin/ChargeCustomerDialog.tsx` | Add audit log call after successful charge |
| `src/pages/admin/Billing.tsx` | Add audit log call after successful retry |
| `supabase/functions/charge-customer/index.ts` | Add server-side audit log insert |

