

## Already Implemented

The admin ACH setup feature is **already fully implemented** in the current codebase:

1. **`create-ach-setup` edge function** (lines 46-66) — already accepts `targetUserId`, verifies admin role, and uses the target customer's profile for Stripe setup
2. **`confirm-ach-setup` edge function** (lines 46-66) — already accepts `targetUserId` with the same admin verification
3. **`AdminAchSetupDialog` component** — already exists at `src/components/admin/AdminAchSetupDialog.tsx`
4. **CustomerDetail.tsx integration** (lines 468-476) — the "Set Up ACH" button already appears next to the "Not Linked" badge when a customer has an application without a payment method

No code changes are needed. The feature is live and ready to use — navigate to any customer's profile tab where ACH shows "Not Linked" and click "Set Up ACH" to run the Stripe Financial Connections flow on their behalf.

