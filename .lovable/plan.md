

# Fix: Stale Payment Status on Customer Payment Setup Page

## Problem
The customer stays on the same page retrying without refreshing. The `PaymentSetup` page only fetches status once on mount (`useEffect` with `[user]` dependency). After we reset their status in the database, the page still shows stale data until they do a full page reload — which they don't know to do.

## Solution
Two small changes to `src/pages/customer/PaymentSetup.tsx`:

1. **Auto-refetch on window focus** — When the customer tabs back to the page (e.g., after checking email or after the Stripe modal closes), re-fetch the payment status automatically.

2. **Add a visible "Refresh Status" button** — A small link/button near the top of the payment setup card that calls `checkPaymentStatus()` so the customer can manually refresh without reloading the entire page. This also helps after admin resets.

### Files to change
- `src/pages/customer/PaymentSetup.tsx` — Add `visibilitychange` listener to auto-refetch, and add a "Refresh Status" button in the UI (~10 lines total).

