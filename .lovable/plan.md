

# Fix: Prevent Double-Activation of Subscriptions

## Problem
Two issues allow admins to accidentally double-charge customers:

1. **The "Activate" button in the dropdown menu** (line 1585-1595) is shown for ANY subscription with a `stripe_subscription_id` and `stripe_customer_id`, regardless of status. An admin can click "Activate Subscription" on an already-active, fully-paid subscription.

2. **The main "Activate" button** (line 1390-1394) uses `activatedIds` as a client-side guard, but this resets on page refresh. After refresh, a subscription that was just activated but hasn't synced to "active" status yet can show "Activate" again.

3. **The edge function itself** does have a guard for "already active + deposit paid" (returns success with `alreadyActive: true`), but the UI still treats this as a successful activation and doesn't differentiate — the admin sees a success toast and might think another charge happened.

## Solution

### 1. Hide "Activate Subscription" from dropdown when not applicable
Only show the dropdown "Activate Subscription" option when `isReadyToActivate` is true, matching the same logic as the main button. Currently it's gated only on `stripe_subscription_id && stripe_customer_id`.

**File: `src/pages/admin/Billing.tsx`** (~line 1585-1596)
- Change the condition from `sub.stripe_subscription_id && sub.stripe_customer_id` to `isReadyToActivate`

### 2. Handle `alreadyActive` response from edge function
When the edge function returns `alreadyActive: true`, show an info toast instead of a success toast, and don't add to `activatedIds`.

**File: `src/pages/admin/Billing.tsx`** (~line 582-589)
- Check `data.alreadyActive` and show `toast.info("Subscription is already active")` instead
- Skip adding to `activatedIds` set

### 3. Treat `deposit_paid === true` as a disqualifier for activation
For subscriptions that are active AND have `deposit_paid === true`, they should never show "Activate". Update `isReadyToActivate` to also exclude subscriptions where deposit is already paid.

**File: `src/pages/admin/Billing.tsx`** (~line 1390-1394)
- Add `&& !sub.deposit_paid` to the active-with-no-payment path, or more simply: exclude any subscription where `sub.status === "active" && sub.deposit_paid`

These are UI-only changes — no database or edge function modifications needed.

