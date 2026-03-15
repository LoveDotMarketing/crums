

## Plan: Email Notification on New Get Started Registration

**What:** After a successful signup on the Get Started page, invoke a new edge function to email sales@, eric@, and ambrosia@crumsleasing.com with the new registrant's details.

**Approach:** Create a new edge function `send-signup-notification` that uses the existing SendGrid integration to send a notification email. Call it from `GetStarted.tsx` after successful signup (fire-and-forget, non-blocking).

### Files to create/modify

1. **Create `supabase/functions/send-signup-notification/index.ts`**
   - Accepts: `firstName`, `lastName`, `email`, `phone`, `companyName`, `referralCode`
   - Sends via SendGrid to the 3 recipients
   - HTML email with registrant details
   - `verify_jwt = false` in config (called right after signup, session may be unstable)
   - CORS headers matching existing pattern

2. **Modify `src/pages/GetStarted.tsx`**
   - After line ~377 (after `fireMetaCapi`), add a fire-and-forget call:
     ```typescript
     supabase.functions.invoke('send-signup-notification', {
       body: { firstName, lastName, email, phone: phoneNumber, companyName, referralCode }
     }).catch(err => console.error('Signup notification error:', err));
     ```
   - Non-blocking — doesn't affect the user's signup flow

### Email content
- **Subject:** `[New Registration] {firstName} {lastName} — CRUMS Leasing`
- **To:** sales@crumsleasing.com, eric@crumsleasing.com, ambrosia@crumsleasing.com
- **From:** notifications@crumsleasing.com (or the existing SendGrid verified sender)
- **Body:** Name, email, phone, company (if provided), referral code (if provided), timestamp

