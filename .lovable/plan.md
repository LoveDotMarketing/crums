

## Problem: "Customer" as Default Name

### Root Cause
When a user signs up, a database trigger (`create_customer_from_profile`) automatically creates a record in the `customers` table. The trigger uses this logic for the name:

```sql
COALESCE(NEW.first_name || ' ' || NEW.last_name, 'Customer')
```

In PostgreSQL, concatenating anything with NULL produces NULL. So if a user signs up without providing first/last name (e.g., via the Login page quick signup), the result is NULL, and COALESCE falls back to the literal string **"Customer"**.

Additionally, this trigger only fires on INSERT -- when the user later fills in their profile name, the `customers.full_name` field is **never updated**. It stays as "Customer" forever.

### Two-Part Fix

**1. Fix the trigger to handle NULL names properly and also sync on profile updates**

Update `create_customer_from_profile` to use `CONCAT_WS` (which skips NULLs) and add a new trigger that syncs profile updates back to the customers table:

- Use `TRIM(CONCAT_WS(' ', NEW.first_name, NEW.last_name))` -- this produces an empty string instead of NULL when both are NULL
- Fall back to 'Customer' only if the trimmed result is empty
- Create a new trigger on `profiles` for UPDATE that syncs `full_name`, `phone`, and `company_name` back to the matching `customers` record

**2. Backfill existing "Customer" records**

Run a one-time update to fix the two existing records that show "Customer" by pulling the actual names from their `profiles` records (where available).

**3. Show company name or email as fallback in the admin table**

Update the Name column in `Customers.tsx` to show the company name or email when `full_name` is still "Customer", so admins always see something useful.

### Files to Change

| File | Change |
|------|--------|
| New migration SQL | Fix trigger, add UPDATE sync trigger, backfill existing data |
| `src/pages/admin/Customers.tsx` (line 784) | Display fallback: show company or email when name is "Customer" |

