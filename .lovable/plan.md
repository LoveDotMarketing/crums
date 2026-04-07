
Fix Stevie’s failed subscription creation by tightening Stripe customer/payment-method matching and exposing the real backend error.

Problem
- Stevie Norwood exists, has trailer 164173 assigned, and has a completed payment setup record.
- There is no local subscription, no subscription items, and nothing created in Stripe for this attempt.
- The admin UI only shows a generic “Edge Function returned a non-2xx status code”.
- Based on the current flow and Stevie’s screenshot showing a $0 immediate charge, the failure is most likely happening at Stripe subscription creation, before any local records are written.
- The current `create-subscription` flow validates a stored payment method too early and only checks that it belongs to some Stripe customer, not necessarily the exact Stripe customer used for the subscription.

What to change

1. Harden `supabase/functions/create-subscription/index.ts`
- Resolve the final Stripe customer first.
- Replace the current early PM validation with a helper that resolves a payment method for that exact Stripe customer:
  - use stored `stripe_payment_method_id` only if `pm.customer === stripeCustomerId`
  - otherwise search live payment methods on that customer by preferred type first, then fallback type
  - if a better match is found, sync `customer_applications.stripe_customer_id` and `stripe_payment_method_id`
  - if no valid PM exists on that customer, return a clear actionable error
- Use that resolved PM everywhere:
  - `default_payment_method` on `stripe.subscriptions.create`
  - deposit charge flow
  - first-period safety-net flow

2. Add stronger logging in `create-subscription`
- Log each pre-Stripe step:
  - customer lookup
  - Stripe customer resolution
  - payment method resolution
  - price creation
  - `stripe.subscriptions.create`
- Catch Stripe API errors and log the exact Stripe message/code so future failures are diagnosable.

3. Improve admin error handling in `src/components/admin/CreateSubscriptionDialog.tsx`
- Surface the backend’s actual error message instead of only the generic non-2xx message.
- Update the client-side guard text from “ACH payment method” to “payment method” since the system supports both ACH and card.

Why this should fix Stevie
- Stevie currently has no existing local or Stripe subscription artifacts, so the failed attempt is safe to retry.
- The most likely issue is stale or mismatched Stripe payment-method/customer linkage, not the trailer assignment itself.
- Once the function resolves the payment method against the exact Stripe customer being billed, the subscription creation should proceed normally.

Technical detail
- Main file: `supabase/functions/create-subscription/index.ts`
- Secondary file: `src/components/admin/CreateSubscriptionDialog.tsx`
- No database migration needed.
- No UI redesign needed.
- No GA/chatbot changes needed.

Expected result after implementation
- Stevie’s subscription can be created successfully.
- If Stripe linkage is stale, the system repairs it or returns a precise message.
- Admins stop seeing the vague generic error and get the real reason immediately.