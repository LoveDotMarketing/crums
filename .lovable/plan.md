

## Fix Sign-Up Flow: Phone Validation and Data Loss Prevention

### Root Cause
The sign-up form has a **phone number format mismatch**. The placeholder says `(555) 123-4567` but the validation requires strict international format like `+15551234567`. When a customer types a normal US number, validation fails with a toast error that may not be obvious -- and if they refresh or navigate away, all form data is lost.

Looking at the specific customer (Do It Moving), their account was created but the profile update failed silently -- first name, last name, and phone are all null, and no application record exists.

### Changes

**1. Fix phone number validation (src/lib/validations.ts)**
- Replace the strict E.164 regex with a lenient US phone regex that accepts formats like `(555) 123-4567`, `555-123-4567`, `5551234567`, etc.
- Apply to both `fullSignupSchema` and `customerApplicationSchema`

**2. Auto-format phone input (src/pages/GetStarted.tsx)**
- Add a phone formatter that auto-formats as the user types: `(555) 123-4567`
- Strip non-digits before saving to database so storage is consistent
- This prevents validation mismatches entirely

**3. Show inline validation errors instead of just toasts**
- Add visible error text below the phone field when format is wrong
- Users on mobile especially may miss toast notifications

**4. Prevent data loss on failed submission**
- Currently if `signUp` succeeds but the profile update fails, the user is stuck -- account exists but can't re-register
- Add error recovery: if profile/application update fails after signup, show a clear error and keep the user on the form rather than navigating away
- The form already catches errors, but the issue is the validation blocks submission before signup even happens

### Files to Modify
- `src/lib/validations.ts` -- Relax phone regex to accept common US formats
- `src/pages/GetStarted.tsx` -- Add phone auto-formatting and inline validation feedback

### Technical Details

**New phone regex:**
```
/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/
```
This accepts: `(555) 123-4567`, `555-123-4567`, `+1 555 123 4567`, `5551234567`

Minimum 10 digits required (after stripping non-digits) to ensure it's a real US number.

**Phone formatter function:**
```typescript
const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
};
```

