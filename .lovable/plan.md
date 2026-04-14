

## Plan: Add Google Ads Enhanced Conversions to All Forms

### What This Does
Google Ads Enhanced Conversions uses first-party customer data (email, phone, name, address) to improve conversion attribution. Before each conversion event, we call `gtag('set', 'user_data', {...})` with hashed user data from form fields.

### Approach
Create a single utility function `setEnhancedConversionData()` in `src/lib/analytics.ts` and call it right before every form submission / conversion event across all public-facing forms.

### 1. New utility in `src/lib/analytics.ts`

Add a `setGoogleAdsUserData` function that accepts first-party data and calls:
```ts
gtag('set', 'user_data', {
  email, phone_number, address: { first_name, last_name, city, state, postal_code, country }
});
```
Fields are optional — only set what's available from the form.

### 2. Forms to update (8 files)

Each form gets a `setGoogleAdsUserData(...)` call inserted **before** the existing tracking calls (e.g., `trackFormSubmission`, `trackConversion`, `fireMetaCapi`):

| File | Available Fields |
|---|---|
| `src/pages/Contact.tsx` | name (split), email, phone |
| `src/pages/GetStarted.tsx` | firstName, lastName, email, phone, city, state, zip |
| `src/pages/FacebookLanding.tsx` | name (split), email, phone |
| `src/pages/GoogleLanding.tsx` | name (split), email, phone |
| `src/pages/LinkedInLanding.tsx` | name (split), email, phone |
| `src/pages/MATS2026.tsx` | full_name (split), email, phone |
| `src/pages/customer/RentalRequest.tsx` | email (from profile), phone |
| `src/pages/Login.tsx` | email only |

### 3. Implementation Details

- The utility will normalize data: lowercase email, strip phone to E.164-ish format
- Google handles the hashing automatically when using `gtag('set', 'user_data', ...)`
- Name splitting: `name.split(' ')` → first word = first_name, rest = last_name
- No new dependencies needed

