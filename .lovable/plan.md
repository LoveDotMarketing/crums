

## Fix Missing Login Logs and Add Real-Time Updates

### Problem
1. **Missing customer login**: `dispatch@groundlinkllc.com` logged in today via session token refresh, but no activity log was recorded. The login tracking only fires during explicit password sign-in (`signIn` function), not when a user returns with a valid session or refreshes their token.
2. **No live updates**: The Logs page requires a manual "Refresh" click to see new entries.

### Root Cause
In `src/hooks/useAuth.tsx`, the `onAuthStateChange` listener updates state but never calls `trackLoginEvent`. The `SIGNED_IN` and `TOKEN_REFRESHED` events are ignored for logging purposes. This means:
- Password logins: logged (via `signIn` function)
- Session restorations (returning users): NOT logged
- Token refreshes: NOT logged

### Solution

**1. Track all auth events in `onAuthStateChange` (`src/hooks/useAuth.tsx`)**

Add login tracking inside the `onAuthStateChange` callback for the `SIGNED_IN` event. Use a ref to prevent duplicate logging (since `SIGNED_IN` fires on both password login and session restore):

- When `event === 'SIGNED_IN'`, fetch the user's role and call `trackLoginEvent`
- Skip if the login was already tracked by the `signIn` function (use a `justSignedIn` ref flag)
- This catches token refreshes and session restorations that currently go unlogged

**2. Add real-time subscription to Logs page (`src/pages/admin/Logs.tsx`)**

- Subscribe to `postgres_changes` on the `user_activity_logs` table
- When a new row is inserted, automatically invalidate the query to refresh the table
- This gives admins a live view without needing to click Refresh

### Technical Details

**File: `src/hooks/useAuth.tsx`**
- Add a `useRef` flag (`signInTrackedRef`) set to `true` inside `signIn()` after tracking
- In `onAuthStateChange`, when `event === 'SIGNED_IN'`:
  - Check if `signInTrackedRef.current` is true; if so, reset it and skip (already logged by `signIn`)
  - Otherwise, fetch role and call `trackLoginEvent` (this is a session restore / token login)

**File: `src/pages/admin/Logs.tsx`**
- Add a `useEffect` with a Supabase realtime channel subscription on `user_activity_logs`
- On `INSERT` event, call `queryClient.invalidateQueries({ queryKey: ['activity-logs'] })`
- Clean up subscription on unmount

### What changes
- All customer/mechanic/admin logins will be captured, whether by password, session restore, or token refresh
- The Logs page will update in real-time as new login/logout events occur
- No data loss for returning users who don't explicitly type their password
