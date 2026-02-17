

## Proactive Fixes: Prevent More Customer Profile/Signup Issues

Based on the patterns from the Do It Moving incident, here are 5 related issues that could hit other customers.

### Issue 1: Full Form Submit Uses `getSession()` Without Retry
In `GetStarted.tsx` line 409, the full application form (step 2 after Quick Start) calls `supabase.auth.getSession()` directly without the retry logic we added for Quick Start. On mobile, this will fail the same way -- silently losing all the document uploads and business details the customer just entered.

**Fix:** Use `getSessionWithRetry()` in `handleFullFormSubmit` instead of direct `getSession()`.

### Issue 2: Application Page Has No Phone Auto-Formatting
The customer Application page (`/customer/application`) has a raw phone input with no formatting or validation (line 400-404). Customers editing their phone here can enter any format, which may conflict with validation elsewhere and create inconsistent data.

**Fix:** Add the same `formatPhoneNumber` handler to the Application page phone fields (main phone and insurance phone).

### Issue 3: Application Page Doesn't Persist Form Data
The Application page (`/customer/application`) has no localStorage persistence. If a customer is halfway through uploading documents and their mobile browser refreshes, all unsaved text fields reset to what was last saved to the database. Document uploads in progress are lost entirely.

**Fix:** Add localStorage persistence for in-progress application edits, similar to the GetStarted form.

### Issue 4: Login Page Signup Creates No Profile Data
When customers sign up via the Login page (not GetStarted), the `signUp` call at line 86 creates the auth account and role, but never updates the profile with first/last name or creates an application record. The `handle_new_user` trigger only sets email. These customers end up with empty profiles and no application -- the exact same "stuck" state as Do It Moving.

**Fix:** After successful signup on the Login page, redirect to `/get-started?complete=true` instead of `/dashboard/customer` so the customer completes their profile immediately.

### Issue 5: No Company Name Field in Completion Mode
When a user hits the completion mode (`/get-started?complete=true`), the company name field is not shown in the form (it's hidden behind `!isCompletionMode` checks along with other fields). Company name should be available in completion mode since it's a key field for the customer record.

**Fix:** Show the company name field in completion mode.

---

### Files to Modify
- `src/pages/GetStarted.tsx` -- Use session retry in full form submit; show company name in completion mode
- `src/pages/Login.tsx` -- Redirect new signups to complete profile instead of dashboard
- `src/pages/customer/Application.tsx` -- Add phone formatting and localStorage persistence for in-progress edits

### Technical Details

**Login page redirect (Login.tsx line 132):**
Change `navigate("/dashboard/customer")` after signup to `navigate("/get-started?complete=true")` so new Login-page signups always complete their profile.

**Full form session fix (GetStarted.tsx line 409):**
Replace:
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) throw new Error("No session found");
```
With:
```typescript
const session = await getSessionWithRetry();
if (!session) throw new Error("Session expired. Please log in again.");
```

**Application page phone formatting:**
Reuse the same `formatPhoneNumber` utility from GetStarted, applied to phone and insurance phone inputs.

**Application page localStorage:**
Save form edits to `crums_application_form` key on change, restore on mount, clear on successful save.

**Company name in completion mode:**
Move the company name input outside the `!isCompletionMode` conditional so it renders in both modes.
