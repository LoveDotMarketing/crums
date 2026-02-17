

## Fix Mobile Sign-Up Data Loss

### Problem
The Do It Moving customer (`doitmoving6@gmail.com`) created an account but their profile is completely empty -- first_name, last_name, phone are all null and no application record exists. They logged in 51 times trying to fix it. Two root causes:

**1. Session race condition after signup**
After `signUp()` succeeds, the code immediately calls `supabase.auth.getSession()`. On mobile (slower networks), the session is often not available yet, causing a "No session found" error. The profile and application updates silently fail, but the account already exists -- so they can't re-register.

**2. No form data persistence**
All form fields are plain React `useState`. On mobile, browsers frequently refresh/kill background tabs. Every time the page reloads, all typed data is gone. This is likely what the customer meant by "kept deleting his info."

### Changes

**1. Persist form data in localStorage (src/pages/GetStarted.tsx)**
- Save Quick Start fields (email, firstName, lastName, phone, companyName) to localStorage on every change
- Restore from localStorage on page load
- Clear localStorage on successful submission
- This prevents data loss from page refreshes and mobile tab kills

**2. Fix session race condition (src/pages/GetStarted.tsx)**
- After `signUp()`, wait for the `onAuthStateChange` SIGNED_IN event instead of immediately calling `getSession()`
- Use a short polling/retry approach: try `getSession()`, and if no session, wait and retry up to 3 times
- This handles the mobile network latency issue

**3. Add incomplete profile detection (src/pages/Login.tsx)**
- After login, check if profile has first_name/last_name/phone
- If profile is incomplete, redirect to `/get-started` with a query param like `?complete=true` so the form pre-fills and lets them finish
- This gives customers like Do It Moving a recovery path

**4. Handle the "complete profile" mode in GetStarted (src/pages/GetStarted.tsx)**
- Detect `?complete=true` query param
- If user is already logged in and profile is incomplete, show the Quick Start form pre-filled from localStorage or profile data
- On submit, just update the profile (skip signUp since account already exists)

### Files to Modify
- `src/pages/GetStarted.tsx` -- localStorage persistence, session retry, complete-profile mode
- `src/pages/Login.tsx` -- Incomplete profile detection and redirect

### Technical Details

**localStorage persistence:**
```typescript
// Save on change
useEffect(() => {
  localStorage.setItem('getStartedForm', JSON.stringify({
    email, firstName, lastName, phoneNumber, companyName
  }));
}, [email, firstName, lastName, phoneNumber, companyName]);

// Restore on mount
useEffect(() => {
  const saved = localStorage.getItem('getStartedForm');
  if (saved) {
    const data = JSON.parse(saved);
    setEmail(data.email || '');
    // ...etc
  }
}, []);
```

**Session retry after signup:**
```typescript
const getSessionWithRetry = async (maxRetries = 3): Promise<Session | null> => {
  for (let i = 0; i < maxRetries; i++) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return null;
};
```

**Incomplete profile redirect (Login.tsx):**
After successful login, before navigating to dashboard, check:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('first_name, last_name, phone')
  .eq('id', user.id)
  .single();

if (!profile?.first_name || !profile?.last_name) {
  navigate('/get-started?complete=true');
  return;
}
```

