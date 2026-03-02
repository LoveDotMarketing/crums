

## Fix: ACH setup for customers without auth accounts

### Root Cause
The `customer_applications.user_id` column has a foreign key constraint to `profiles(id)`. When an admin tries to set up ACH for an imported customer (no auth account), the edge function attempts to insert a `customer_applications` row using the `customers.id` as `user_id`. This fails because that UUID does not exist in the `profiles` table.

### Solution
Add a nullable `customer_id` column to `customer_applications` that references the `customers` table. For imported customers without auth accounts, store the link via `customer_id` instead of `user_id`.

### Changes

**1. Database migration**
- Add `customer_id UUID NULLABLE REFERENCES customers(id)` to `customer_applications`
- Create a unique index on `customer_id` (when not null)

**2. `supabase/functions/create-ach-setup/index.ts`**
- In the customer-record path (no auth user): insert with `customer_id` instead of `user_id`
- Set `user_id` to the admin's own user id as a placeholder (since `user_id` is NOT NULL with FK to profiles), OR query by `customer_id` first
- Actually, better approach: make `user_id` nullable in the migration, then insert with `customer_id` only and leave `user_id` null

**3. `supabase/functions/confirm-ach-setup/index.ts`**
- When `customerId` is provided, look up `customer_applications` by `customer_id` instead of `user_id`

**4. `src/pages/admin/CustomerDetail.tsx`**
- Update application query fallback to query by `customer_id` column instead of `user_id`

### Technical detail

The migration will:
1. Add `customer_id UUID REFERENCES customers(id)` column
2. Alter `user_id` to be nullable (so rows can exist for non-auth customers)
3. Drop the NOT NULL constraint on `user_id`

Edge function insert for customer-record path changes from:
```
INSERT { user_id: customerId, ... }  // fails FK
```
to:
```
INSERT { customer_id: customerId, user_id: null, ... }  // works
```

