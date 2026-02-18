
# Fix Two Issues from Event History

## Issues Identified

### Issue 1 — allisaacsdev@gmail.com: "Application save failed: new row violates row-level security policy"

**Root Cause:** When `allisaacsdev@gmail.com` submitted their application at 22:59, the form's `handleSubmit` attempted a `upsert` with `onConflict: 'user_id'`. The failure with "new row violates row-level security policy" on an INSERT operation means `auth.uid()` did not match the `user_id` being sent — this happens when the Supabase auth session has expired or refreshed mid-flow, causing `auth.uid()` to return null or a stale value at the moment of the database call.

This is a transient session timing issue. The user succeeded on their next two attempts (23:00 and 23:02), confirming the session stabilized. The fix is to add a **session refresh guard** in the `handleSubmit` function — refresh the session before the critical upsert, and surface a clearer error message if the session is missing, prompting the user to re-login rather than silently failing.

**Secondary hardening:** The auto-save in `Application.tsx` (line 181) does a `upsert` without `status` — on a row that might not exist yet. This could cause a race condition where the auto-save fires before the signup flow has created the application row, resulting in an INSERT that hits the NOT NULL constraint on `phone_number` (since `profile.phone` could be empty). We'll add a guard to skip auto-save if `profile.phone` is empty.

### Issue 2 — randygray238@gmail.com: "Signup failed: User already registered"

**Root Cause:** Randy Gray successfully signed up on **Feb 17 at 5:16 PM**, then tried to sign up again on **Feb 18 at 7:48 AM** — about 14 hours later. The second attempt failed because the email was already registered. This is expected behavior from Supabase Auth. However, the error message shown to the user ("User already registered") is technical and unhelpful. The fix is to **detect this specific error** in the signup flow and show a friendly message directing the user to the login page.

## What Will Be Changed

### Fix 1 — `src/pages/customer/Application.tsx`

**a) Session refresh guard in `handleSubmit`:** Before the upsert, call `supabase.auth.getSession()` and if the session is missing or expired, call `supabase.auth.refreshSession()`. If still no session, show a user-friendly toast: "Your session expired. Please refresh and try again." and return early — preventing the RLS violation from ever firing.

**b) Auto-save guard:** In `autoSaveToDb`, add an early return if `profile.phone` is empty (the required NOT NULL field), preventing the auto-save from attempting an INSERT with an invalid row.

### Fix 2 — `src/pages/GetStarted.tsx`

In the `handleQuickStart` function's error handler (around line 285-290), intercept the specific error message `"User already registered"` and replace the displayed toast with a helpful message:

> "It looks like you already have an account. Please sign in instead."

...with a link/action directing them to `/login`. This turns a confusing technical error into clear guidance.

## Files Changed

| File | Change |
|---|---|
| `src/pages/customer/Application.tsx` | Add session refresh guard before upsert in `handleSubmit`; add phone guard in `autoSaveToDb` |
| `src/pages/GetStarted.tsx` | Detect "User already registered" error and show friendly login redirect message |

## No Database Changes Needed

Both issues are application-level — no RLS policies need to change, no migrations are required. The RLS policies are correctly written; the issues are timing/UX problems in the client code.
