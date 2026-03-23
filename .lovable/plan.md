

## Fix Referral Code Field to Accept All Code Types

### Problem
The referral code field on the signup page shows placeholder "CRUMS-XXXXXX" and hints that codes must start with "CRUMS-", which confuses partners like Big Bird who use codes like "BIGBIRD". The field should accept partner codes, staff codes, and customer referral codes without showing format-specific hints.

### Changes

**1. `src/pages/GetStarted.tsx` — Update referral code field UX**
- Change placeholder from "CRUMS-XXXXXX" to "Enter code" (or "e.g., BIGBIRD or CRUMS-ABC123")
- Add a subtle helper text like "Partner, staff, or referral code" instead of format-specific guidance
- Remove the `Gift` icon label if it's confusing, or keep it — minor detail

**2. `src/lib/referral.ts` — `processReferralCode` already handles this correctly**
- Partner codes are checked first, then staff codes, then customer CRUMS-format codes
- No logic changes needed here — the flow is correct
- The `validateReferralCode` function is only called for customer codes (after partner/staff checks fail), so it won't block "BIGBIRD"

### Files Changed
- `src/pages/GetStarted.tsx` — update placeholder text and remove CRUMS-specific hint

