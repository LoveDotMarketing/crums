

## Failsafe Options for ACH Billing Errors

### The Problem
Once an ACH charge is initiated, funds take 5-7 business days to settle. During that window you can't simply "undo" it — you're stuck waiting to refund. You need safeguards **before** the charge fires, not after.

### Recommended Approach: Multi-Layer Prevention

We should implement **three layers** that work together:

---

### Layer 1 — Confirmation Gate with Amount Warnings

**Where:** `ChargeCustomerDialog.tsx` and `CreateSubscriptionDialog.tsx`

Add a two-step confirmation for any charge:
- After clicking "Charge", show a **review step** with the exact dollar amount, customer name, and payment method type (ACH/Card)
- For amounts over $1,000, show a **red warning banner**: "This is a large charge. ACH charges cannot be reversed for 5-7 business days."
- Require the admin to type the amount to confirm (like GitHub's delete repo pattern) for charges over $2,000
- Same pattern for subscription creation: show a total summary (monthly × trailers + deposit) before final submit

### Layer 2 — Admin Charge Limits & Cooldowns

**Where:** `charge-customer/index.ts` edge function + new `admin_billing_limits` table

- Set a per-charge ceiling (e.g., $5,000) that requires a second admin approval or override code
- Add a cooldown: block duplicate charges to the same customer within 10 minutes
- Log and flag any charge that exceeds the customer's typical monthly billing amount by 2x+

**Database change:** Add an `admin_billing_limits` config table or use a simple threshold constant in the edge function.

### Layer 3 — Grace Period with Auto-Void

**Where:** New `void-pending-charge` edge function + Billing dashboard UI

- After any manual charge or subscription activation, start a **30-minute void window**
- During this window, show a "Void" button next to the charge in the billing dashboard
- Voiding calls `stripe.invoices.void()` on the invoice before ACH settles
- Stripe allows voiding an invoice that's `open` or even `paid` (for ACH, the payment_intent stays in `processing` for days — the invoice can still be voided during this state)
- After 30 minutes, the void button disappears and normal refund flow applies

---

### What Gets Built

| File | Change |
|------|--------|
| `src/components/admin/ChargeCustomerDialog.tsx` | Add 2-step confirmation with amount warning and type-to-confirm for large charges |
| `src/components/admin/CreateSubscriptionDialog.tsx` | Add summary review step before final creation |
| `supabase/functions/charge-customer/index.ts` | Add duplicate detection (same customer within 10 min), amount ceiling check |
| `supabase/functions/void-charge/index.ts` | **New** — void a Stripe invoice by ID within the grace window |
| `src/pages/admin/Billing.tsx` | Add "Void" button on recent charges within 30-min window |

### Technical Notes
- Stripe ACH invoices stay in `processing` status for days — `invoices.void()` works on `open` invoices, and for `processing` payments you can cancel the PaymentIntent
- The void window is enforced both client-side (hide button after 30 min) and server-side (edge function checks invoice `created` timestamp)
- All void actions are audit-logged the same way charges are

