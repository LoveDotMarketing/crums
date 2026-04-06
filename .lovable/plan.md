

## Fix: Referral Code Not Showing for Customers

### Root Cause

The ReferralCard component chains 3 separate RLS-protected queries (profiles → customers → referral_codes). When a customer is logged in, the nested RLS evaluation across tables can silently fail — particularly the `referral_codes` policy contains a subquery that itself must pass through `customers` RLS, which contains another subquery to `profiles`. This nested RLS chain is fragile and silently returns empty results.

### Solution

Create a `SECURITY DEFINER` database function that returns the current user's referral code directly, bypassing the nested RLS chain. Then update the ReferralCard component to call this function instead of chaining 3 separate queries.

### Changes

**1. Database migration — create `get_my_referral_code()` function**

```sql
CREATE OR REPLACE FUNCTION public.get_my_referral_code()
RETURNS TABLE(id uuid, code text, is_active boolean, customer_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rc.id, rc.code, rc.is_active, rc.customer_id
  FROM referral_codes rc
  JOIN customers c ON c.id = rc.customer_id
  JOIN profiles p ON lower(p.email) = lower(c.email)
  WHERE p.id = auth.uid();
$$;
```

**2. File: `src/components/customer/ReferralCard.tsx`**

Replace the 3-query chain in `fetchReferralData` with:
- Call `supabase.rpc('get_my_referral_code')` to get the referral code in one shot
- Keep the existing `referrals` query (its RLS already works since it chains off the code ID we now have)
- Add error logging to make future debugging easier

This eliminates the nested RLS problem entirely since the SECURITY DEFINER function runs with elevated privileges and handles the email join internally.

### Files Modified
| File | Change |
|------|--------|
| New migration | Create `get_my_referral_code()` SECURITY DEFINER function |
| `src/components/customer/ReferralCard.tsx` | Use `rpc('get_my_referral_code')` instead of 3 chained queries |

