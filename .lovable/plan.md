

## Fix: Case-Insensitive Email Matching in ReferralCard

### Problem
The `ReferralCard` component queries the `customers` table using `.eq("email", profile.email)` which is case-sensitive. For Azptrucking@gmail.com, the profile stores `azptrucking@gmail.com` (lowercase) while the customer record has `Azptrucking@gmail.com` (capital A). This causes the referral code lookup to fail silently, showing "Your referral code will be generated once your account is fully set up."

This same case-sensitivity issue likely affects other components that join profiles to customers by email.

### Fix

**File: `src/components/customer/ReferralCard.tsx`**

Replace the case-sensitive customer lookup:
```typescript
.eq("email", profile.email)
```
with a case-insensitive match using Supabase's `ilike`:
```typescript
.ilike("email", profile.email)
```

This is a one-line change that ensures the referral code displays correctly regardless of email casing differences between the profile and customer tables.

### Files Modified
| File | Change |
|------|--------|
| `src/components/customer/ReferralCard.tsx` | Change `.eq("email", ...)` to `.ilike("email", ...)` for customer lookup |

