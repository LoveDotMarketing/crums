
# Fix Staff Invitation Email Issue

## Problem Identified
The `invite-staff` edge function is calling **two email-sending methods** in succession:
1. `auth.admin.generateLink({ type: "recovery" })` - Generates a link and triggers the email hook
2. `auth.resetPasswordForEmail()` - Attempts to send another password reset email

The second call hits the Supabase rate limit (59-second cooldown between recovery emails), so no email actually gets delivered to the new staff member.

## Solution
Remove the redundant `resetPasswordForEmail()` call and rely on `generateLink()` which already sends the email via the configured email hook.

---

## Technical Changes

### File: `supabase/functions/invite-staff/index.ts`

**Current code (lines 177-205):**
```typescript
// Generate password reset link and send email
const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
  type: "recovery",
  email: email.toLowerCase(),
});

if (linkError) {
  // ... error handling
}

// Send password reset email using Supabase's built-in email
const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
  email.toLowerCase(),
  {
    redirectTo: `${req.headers.get("origin") || "https://crumsleasing.com"}/reset-password`,
  }
);
```

**Updated code:**
```typescript
// Generate password reset link - this triggers the email hook automatically
const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
  type: "recovery",
  email: email.toLowerCase(),
  options: {
    redirectTo: `${req.headers.get("origin") || "https://crumsleasing.com"}/reset-password`,
  },
});

if (linkError) {
  console.error("[invite-staff] Generate link error:", linkError);
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `User created with ${role} role but password reset email could not be sent. They can use 'Forgot Password' to set their password.`,
      userId 
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Email is sent automatically via the email hook - no need for resetPasswordForEmail
console.log(`[invite-staff] Recovery email sent via hook to ${email}`);
```

**Changes:**
1. Add `options.redirectTo` to the `generateLink` call so the correct redirect URL is used
2. Remove the redundant `resetPasswordForEmail()` call entirely
3. Update logging to clarify email is sent via hook

---

## Why This Works
The project has an email hook configured (`https://api.lovable.dev/projects/.../backend/email-hook`) that intercepts and sends authentication emails. When `generateLink({ type: "recovery" })` is called, this hook automatically sends the password reset email.

## Verification After Fix
Once deployed, the next staff invitation will:
1. Create the user account
2. Assign the role
3. Generate recovery link with proper redirect URL
4. Email hook sends the password reset email (no rate limit conflict)

---

## Immediate Workaround for sales@crumsleasing.com
Since the account exists but no email was received, the user can:
1. Go to `/forgot-password`
2. Enter `sales@crumsleasing.com`
3. Receive a password reset email
4. Set their password and log in

Or an admin can manually trigger the reset from the Staff page if that feature exists.
