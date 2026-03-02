

## Plan: Enable ACH setup for customers without auth accounts

Currently, admin ACH setup requires a linked auth account (`profile`). Imported customers who never logged in have no auth record, blocking admins from linking their bank account. This plan removes that dependency.

### Problem

- `AdminAchSetupDialog` requires `targetUserId` (an auth user UUID)
- `create-ach-setup` edge function looks up `profiles` table by that UUID
- `confirm-ach-setup` stores the payment method on `customer_applications` keyed by `user_id`
- Imported customers have a `customers` record but no `profiles` or `customer_applications` row

### Solution

Allow ACH setup using the **customer record ID** directly (from the `customers` table), bypassing the auth user requirement entirely.

### Changes

**1. `src/components/admin/AdminAchSetupDialog.tsx`**
- Add an optional `customerEmail` prop alongside `targetUserId` (which becomes optional)
- Add a new optional `customerId` prop (the `customers` table UUID)
- Pass `customerId` and `customerEmail` to the edge function when no auth user exists

**2. `src/pages/admin/CustomerDetail.tsx`**
- Remove the `{profile && ...}` guard around `AdminAchSetupDialog`
- Always render the dialog, passing `targetUserId` (if profile exists), plus `customerId` and `customerEmail` from the customer record
- Remove the "No auth account" fallback text

**3. `supabase/functions/create-ach-setup/index.ts`**
- Accept optional `customerId` and `customerEmail` in the request body (in addition to existing `targetUserId`)
- When `targetUserId` is absent but `customerId`/`customerEmail` are provided:
  - Skip profile lookup
  - Use email/name from the `customers` table directly
  - Create or find Stripe customer using that data
  - Create/find `customer_applications` row keyed by `customerId` (store in a new-style lookup or use a sentinel approach)
- The existing `targetUserId` path remains unchanged

**4. `supabase/functions/confirm-ach-setup/index.ts`**
- Accept optional `customerId` as alternative to `targetUserId`
- When `customerId` is provided without `targetUserId`, look up `customer_applications` by customer record instead of `user_id`

### Technical detail

For customers without auth accounts, the `customer_applications` row will use the **customer table UUID** in the `user_id` column as a placeholder. This keeps the existing schema intact — when the customer eventually creates an account, the admin can re-link or the system can migrate the record. The Stripe customer is created using email/name from the `customers` table.

```text
With auth account:        customer.email → profiles.id → customer_applications.user_id
Without auth account:     customer.email → customer.id → customer_applications.user_id (placeholder)
```

The `create-ach-setup` function distinguishes the two paths based on which parameters are provided. Admin role verification remains required for both paths.

