

## Persist & Display Lead Source Attribution in Admin

### Problem
Lead source data (UTM params, referrer, landing page) is captured in sessionStorage and sent with contact form emails, but it is **never saved to the database** during signup/registration on `/get-started`. The admin area has no way to see where a customer originally came from.

### Solution

**1. Database: Add lead source columns to `customer_applications`**

Add these columns to the existing `customer_applications` table (no new table needed — this is where applications land):
- `utm_source` (text, nullable)
- `utm_medium` (text, nullable)  
- `utm_campaign` (text, nullable)
- `utm_term` (text, nullable)
- `utm_content` (text, nullable)
- `referrer` (text, nullable)
- `landing_page` (text, nullable)
- `lead_source_raw` (jsonb, nullable) — stores the full raw data for future use

**2. GetStarted.tsx: Save lead source data on signup**

Import `getLeadSourceData` and `inferSourceType` from `leadSourceTracking.ts`. When upserting the `customer_applications` record (both in quick-start and completion flows), include the lead source fields from sessionStorage.

**3. RentalRequest.tsx: Save lead source data on rental request**

Same pattern — include lead source fields when upserting the application.

**4. Admin Applications page: Show lead source badge**

In `src/pages/admin/Applications.tsx`, display a colored badge next to each application showing the inferred source (e.g., "Google (paid)", "Google (organic)", "Facebook", "Direct"). Show UTM details in the application detail dialog.

**5. Admin LeadSources page: Include registration attribution**

Update `src/pages/admin/LeadSources.tsx` to query `customer_applications` lead source data alongside existing analytics, giving a unified view of where registrations come from.

### Files Changed
- **Database migration** — add lead source columns to `customer_applications`
- **`src/pages/GetStarted.tsx`** — persist lead source data on signup
- **`src/pages/customer/RentalRequest.tsx`** — persist lead source data on rental request
- **`src/pages/admin/Applications.tsx`** — display lead source badge + details
- **`src/pages/admin/LeadSources.tsx`** — incorporate registration attribution data

