
Goal: replace the cramped popup subscription flow with a full on-page form and remove the current failure point so Abdul’s 6‑month/$700/1st-of-month setup works reliably.

What I found
- The current form is in `CreateSubscriptionDialog` and is constrained by:
  - `DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"` (causes vertical + horizontal scroll inside modal).
- Billing page (`src/pages/admin/Billing.tsx`) mounts this as a popup button in the Subscriptions tab header.
- The recent ACH guard can still fail for Abdul due to email case mismatch:
  - `customers.email = "Azptrucking@gmail.com"` vs `profiles.email = "azptrucking@gmail.com"`.
  - Current lookup uses case-sensitive `.eq("email", customer.email)`.
- Abdul does have an ACH method on his application (`stripe_payment_method_id` exists), so this is a lookup robustness issue, not missing ACH.

Implementation plan

1) Move creation UI from popup to full page area inside Billing
- Refactor `CreateSubscriptionDialog` into dual rendering modes:
  - `mode="dialog"` (existing behavior, optional to keep)
  - `mode="inline"` (new full-form on-page render, no modal container)
- Extract shared form body/actions so business logic stays in one place.
- In inline mode:
  - Render in a normal page/card container (no `max-h` modal clipping).
  - Keep sections visible with proper spacing.
  - Use local `overflow-x-auto` only around trailer table (not whole page).

2) Update Billing page to open form on-page (not popup)
- In `src/pages/admin/Billing.tsx`:
  - Add a dedicated tab: `Create Subscription`.
  - Replace popup trigger with button that switches to this tab.
  - Render `<CreateSubscriptionDialog mode="inline" ... />` inside tab content.
  - On success, invalidate billing queries and switch back to Subscriptions tab.

3) Harden ACH guard so it works with real data variations
- Update both:
  - `src/components/admin/CreateSubscriptionDialog.tsx`
  - `supabase/functions/create-subscription/index.ts`
- Changes:
  - Make profile email match case-insensitive (normalize/lowercase approach).
  - Keep both resolution paths:
    - profile -> user_id -> customer_applications
    - customer_id -> customer_applications fallback
  - Avoid brittle single-row assumptions for application lookups (select latest valid row logic instead of strict single-row expectation where needed).
  - Return clearer actionable error text if ACH truly missing.

4) UX safeguards for long form completion
- Add sticky bottom action bar in inline mode (`Cancel` / `Create Subscription`) so submit is always reachable.
- Keep summary visible near action area.
- Preserve existing validation and mutation behavior; no backend schema changes required.

Files to update
- `src/components/admin/CreateSubscriptionDialog.tsx`
- `src/pages/admin/Billing.tsx`
- `supabase/functions/create-subscription/index.ts`

Verification checklist (start-to-end)
1. Go to Admin Billing -> Create Subscription tab.
2. Select Abdul.
3. Choose `6 Month Lease`, set deposit `700`, billing cycle `monthly`, anchor day `1`.
4. Select trailer(s) and submit.
5. Confirm:
   - No “linked account/ACH” false error.
   - Success toast and subscription appears in Subscriptions tab.
   - Next billing date resolves to the 1st of next month.
   - Customer billing/rentals still show `6 Mo Lease` / `6 Month Lease` labels correctly.

Notes
- No database migration needed for this change.
- This plan addresses both complaints: usability (no popup clipping) and reliability (lookup failure despite existing ACH).
