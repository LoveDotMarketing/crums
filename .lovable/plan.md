

## Plan: Add Full Subscription Editing Capabilities

### Current State
You already have an **Edit Subscription panel** that can change subscription type, billing cycle, dates, deposit, and manage trailers. You also have a **Customer Form dialog** for editing customer info, and a **Billing Date dialog** for pre-activation anchor changes.

What's missing is the ability to edit the **monthly rate per trailer** and to **sync billing date and payment method changes to Stripe** on live subscriptions.

### Changes

**1. Add Monthly Rate Editing to Edit Subscription Panel**
- File: `src/components/admin/EditSubscriptionPanel.tsx`
- Add an editable rate input next to each trailer in the "Assigned Trailers" card
- On save, update the `monthly_rate` column in `subscription_items` AND call `modify-subscription` (or a new Stripe update) to change the price on the Stripe subscription item

**2. Add Billing Date Change for Active Subscriptions**
- File: `src/components/admin/EditSubscriptionPanel.tsx`
- Add a "Next Billing Date" picker that updates `next_billing_date` on the subscription
- File: `supabase/functions/modify-subscription/index.ts`
- Add a new action `change_billing_date` that updates the Stripe subscription's `billing_cycle_anchor` (Stripe allows this on active subscriptions) and updates `next_billing_date` locally

**3. Add Payment Method Management from Admin Side**
- File: `src/components/admin/EditSubscriptionPanel.tsx`
- Display current payment method type (ACH/Card) with a "Reset Payment Setup" button
- This already exists on the Applications page — wire the same `reset-payment-setup` edge function call into the Edit Subscription panel so admins can trigger a payment method reset without navigating away

**4. Link Customer Info Editing from Edit Subscription**
- File: `src/components/admin/EditSubscriptionPanel.tsx`
- Add an "Edit Customer" button that opens the existing `CustomerFormDialog` pre-filled with the subscription's customer data
- No new components needed — just import and wire the existing dialog

### What This Solves
Admins can adjust monthly rates, billing dates, payment methods, and customer info on existing subscriptions — all without deleting and recreating anything.

