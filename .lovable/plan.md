

# Enable Manual Bank Account Entry in ACH Setup

## Root Cause

The current `create-ach-setup` edge function creates a SetupIntent with `financial_connections` configured, but does **not** enable the `manual_entry` option. Stripe's Financial Connections modal only shows the bank search/login flow by default. Customers whose bank is not listed in Financial Connections have no fallback to manually enter their routing and account numbers.

This is a **code change**, not a Stripe Dashboard setting. The `manual_entry` mode is controlled via the SetupIntent API parameters.

## Fix

Add `manual_entry: { mode: "automatic" }` to the `financial_connections` configuration in the SetupIntent creation. This tells Stripe to show a "Enter manually" link at the bottom of the Financial Connections modal as a fallback when the customer's bank isn't found.

### Change

| File | Change |
|---|---|
| `supabase/functions/create-ach-setup/index.ts` (lines 106-112) | Add `manual_entry` to the `financial_connections` config |

The updated SetupIntent creation will look like:

```typescript
payment_method_options: {
  us_bank_account: {
    financial_connections: {
      permissions: ["payment_method", "balances"],
      manual_entry: { mode: "automatic" },
    },
    verification_method: "automatic",
  },
},
```

### How It Works

- With `manual_entry.mode: "automatic"`, Stripe shows a "Link account manually" option in the Financial Connections UI
- When selected, the customer enters their routing number and account number directly
- Stripe then verifies the account via microdeposits (two small deposits the customer confirms later)
- The `verification_method: "automatic"` already in place handles this -- it falls back to microdeposits when instant verification isn't available

### No Other Changes Needed

- The client-side code in `PaymentSetup.tsx` already handles the `requires_action` status (line 181-184), which is the expected state after microdeposit-based verification
- The `confirm-ach-setup` edge function already handles all terminal states correctly

