

## Fix: Show reset button for all payment setup statuses

The reset button is currently conditionally rendered only when `payment_setup_status === "completed"`. BMS is already in `"pending"` status (from a previous DB-only reset), so no reset button appears — but stale Stripe-side payment methods may still be blocking the flow.

### Change
In `src/pages/admin/Applications.tsx`, move the reset button outside the `completed`-only conditional so it appears for **any** application that has a `stripe_customer_id` (meaning a Stripe customer exists that could have stale methods). Keep the "ACH ✓" / "Card ✓" badge inside the `completed` conditional.

This is a single-line conditional change — the reset button markup stays the same, just its visibility condition broadens from `status === "completed"` to `app.stripe_customer_id exists`.

### File
- `src/pages/admin/Applications.tsx` (~line 774–801): Extract the reset `<Button>` from inside the `completed` block. Show it whenever the application has a `stripe_customer_id`, regardless of `payment_setup_status`.

