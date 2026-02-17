
# Fix Customer Data Accuracy Across All Customer Pages

## Problems Found

### 1. Billing Page Shows Wrong Customer's Data (During Impersonation)
The Billing page (`customer/Billing.tsx`) queries `customer_subscriptions` with `.maybeSingle()` and **no customer filter** -- it relies entirely on RLS. When an admin uses "View As", the admin's RLS policy returns ALL subscriptions, so `.maybeSingle()` picks a random customer's subscription. This is why trailers 130035 and 248088 at $1,000/mo appeared for Trinity.

### 2. Dashboard and Rentals Use Admin's Email During Impersonation
- `CustomerDashboard.tsx` uses `user.email` (the admin's email) for `fetchSubscriptionStatus()` and `fetchTrailers()` instead of the impersonated customer's email
- `Rentals.tsx` uses `user?.email` for its data fetch instead of the impersonated customer's email
- The Profile page already handles this correctly with `currentEmail`

### 3. Case-Sensitive Email Lookups
All customer pages use `.eq('email', ...)` which is case-sensitive. If the customers table has `Trinityfreightllc@gmail.com` but the profiles table has `trinityfreightllc@gmail.com`, queries fail silently and return no data.

### 4. RLS Policies Use Case-Sensitive Email Joins
Multiple RLS policies (on `customer_subscriptions`, `billing_history`, `trailers`, etc.) join `profiles.email = customers.email` which is case-sensitive. This means customers with mixed-case emails may be silently denied access to their own data.

---

## Plan

### Step 1: Fix Billing Page Data Source
Update `customer/Billing.tsx` to follow the same pattern as Profile page:
- First look up the customer record by email (using the impersonated email when applicable)
- Then filter `customer_subscriptions` by `customer_id`
- This prevents showing another customer's subscription data

### Step 2: Fix Dashboard Email References
Update `CustomerDashboard.tsx`:
- Add `currentEmail` variable (impersonated email or user email)
- Change `fetchSubscriptionStatus()` and `fetchTrailers()` to use `currentEmail` instead of `user.email`

### Step 3: Fix Rentals Page Email Reference
Update `Rentals.tsx`:
- Add impersonation awareness using `useAuth()` destructuring
- Use the impersonated customer's email instead of `user?.email`

### Step 4: Case-Insensitive Email Queries
Change all `.eq('email', ...)` customer lookups to `.ilike('email', ...)` across:
- `customer/Billing.tsx`
- `customer/CustomerDashboard.tsx`
- `customer/Profile.tsx`
- `customer/Rentals.tsx`

### Step 5: Fix RLS Policies (Database Migration)
Update RLS policies that join `profiles.email = customers.email` to use `lower(p.email) = lower(c.email)` on these tables:
- `customer_subscriptions`
- `billing_history`
- `trailers`
- `trailer_checkout_agreements`
- `dot_inspections`

---

## Technical Details

### Files Modified
- `src/pages/customer/Billing.tsx` -- Add customer lookup, filter by customer_id, use impersonated email
- `src/pages/customer/CustomerDashboard.tsx` -- Use `currentEmail` for subscription/trailer queries
- `src/pages/customer/Rentals.tsx` -- Add impersonation awareness, use correct email
- `src/pages/customer/Profile.tsx` -- Switch `.eq` to `.ilike` for email lookup
- New database migration -- Update RLS policies for case-insensitive email matching

### Pattern to Follow (from Profile.tsx)
```text
const currentEmail = isImpersonating && impersonatedUser 
  ? impersonatedUser.email 
  : user?.email;

// Then use currentEmail with .ilike() for customer lookups
```
