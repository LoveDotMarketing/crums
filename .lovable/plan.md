

## Auto-Prepend "CRUMS-" Prefix for Referral Codes

### Problem
If a user types just `D8127E` instead of `CRUMS-D8127E`, the code fails validation because `validateReferralCode` requires the `CRUMS-` prefix. The code should work either way.

### Solution
Update `normalizeReferralCode` to auto-prepend `CRUMS-` when the input is a bare 6-character alphanumeric string. This single change fixes all downstream flows (validation, processing, sharing links) since everything goes through this function.

### Changes

**File: `src/lib/referral.ts`**

Update `normalizeReferralCode`:
```typescript
export const normalizeReferralCode = (code: string): string => {
  const trimmed = code.trim().toUpperCase();
  // Auto-prepend CRUMS- if user entered just the 6-char suffix
  if (/^[A-Z0-9]{6}$/.test(trimmed)) {
    return `CRUMS-${trimmed}`;
  }
  return trimmed;
};
```

This ensures:
- `D8127E` → `CRUMS-D8127E` ✓
- `CRUMS-D8127E` → `CRUMS-D8127E` ✓
- `crums-d8127e` → `CRUMS-D8127E` ✓
- Partner/staff codes (e.g. `BIGBIRD`) won't be affected since they're checked before customer code validation

Also update `validateReferralCode` to call `normalizeReferralCode` (it already does), so validation will pass for bare suffixes too.

**File: `src/pages/Login.tsx`**

The inline validation visual feedback calls `validateReferralCode(referralCode)` — since that already uses `normalizeReferralCode` internally, this will automatically work for bare codes. No change needed.

### Files Modified
| File | Change |
|------|--------|
| `src/lib/referral.ts` | Auto-prepend `CRUMS-` in `normalizeReferralCode` for 6-char alphanumeric input |

