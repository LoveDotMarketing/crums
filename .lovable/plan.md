

## Plan: Comprehensive Billing Safeguard Review and Hardening

After reviewing all billing-related edge functions and UI components, here are the remaining risks and fixes needed.

### Risks Found

**1. `charge-toll/index.ts` — No admin role check**
The function authenticates the user but never verifies they are an admin. Any authenticated user (customer, mechanic) can charge tolls to any customer via Stripe. This is a critical gap.

**2. `charge-toll/index.ts` — No amount ceiling or audit logging**
Unlike `charge-customer`, tolls have no maximum amount guard and no `app_event_logs` audit trail. A toll with an accidentally large amount would charge without safeguards.

**3. `charge-customer/index.ts` — Dangling invoice items risk**
When creating an invoice item then creating an invoice with default `pending_invoice_items_behavior`, if the invoice creation fails, the invoice item remains on the Stripe customer and gets swept into the NEXT invoice automatically. This is the same class of bug that caused the $15,480 overcharge. Should use `pending_invoice_items_behavior: 'exclude'` and attach items explicitly.

**4. `charge-toll/index.ts` — Same dangling invoice items risk**
Creates invoice item, then creates invoice without `pending_invoice_items_behavior: 'exclude'`. Orphaned items could stack onto future invoices.

**5. `activate-subscription/index.ts` — No subscription-level amount sanity check**
The "first period charge" safety net (lines 396-443) sums up all Stripe subscription items and charges them. If a subscription somehow had many items or very high prices, there is no ceiling. Should add a sanity check.

**6. `create-subscription/index.ts` — Deposit standalone invoice (line 528-540)**
The deposit fallback path creates an invoice without `pending_invoice_items_behavior: 'exclude'`, so it could pick up stale pending invoice items from the Stripe customer — inflating the charge.

### Changes

| File | Change |
|------|--------|
| `supabase/functions/charge-toll/index.ts` | Add admin role verification, $2,000 toll ceiling, audit logging, use `pending_invoice_items_behavior: 'exclude'` with explicit invoice item attachment |
| `supabase/functions/charge-customer/index.ts` | Switch to `pending_invoice_items_behavior: 'exclude'` and attach invoice item explicitly to prevent dangling items |
| `supabase/functions/activate-subscription/index.ts` | Add $10,000 sanity ceiling on first-period charge; add `pending_invoice_items_behavior: 'exclude'` on deposit invoice (already done there, confirm consistency) |
| `supabase/functions/create-subscription/index.ts` | Add `pending_invoice_items_behavior: 'exclude'` to the standalone deposit invoice fallback (line 528) |

### Technical Details

**Dangling invoice item fix pattern** (applied to charge-customer and charge-toll):
```typescript
// Before (dangerous):
await stripe.invoiceItems.create({ customer, amount, description });
const invoice = await stripe.invoices.create({ customer, ... });

// After (safe):
const invoice = await stripe.invoices.create({
  customer,
  pending_invoice_items_behavior: 'exclude',
  ...
});
await stripe.invoiceItems.create({ customer, invoice: invoice.id, amount, description });
```

This ensures that if the invoice item is created, it is explicitly tied to the invoice. No orphaned items can leak into future invoices.

**Toll ceiling**: $2,000 max per toll charge (tolls are typically $5-$50; anything over $2,000 is clearly an error).

**First-period ceiling**: $10,000 max on the activate-subscription safety net charge. If the calculated amount exceeds this, the function throws an error requiring manual review.

