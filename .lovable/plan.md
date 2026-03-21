

## Fix Google Ads Lead Attribution

### Problem
Leads arriving via Google Ads through syndicated search (referrer containing "syndicatedsearch.goog") or landing on `/lp/` pages are being classified as "referral" or "organic" instead of "Google PPC". The source/medium inference logic doesn't recognize these paid traffic patterns.

### Solution

Update the source/medium inference logic in three places:

**1. `src/lib/leadSourceTracking.ts` — `captureLeadSource()` and `inferSourceType()`**
- In `captureLeadSource()`: Before storing, check if the referrer contains "syndicatedsearch" or the landing page starts with `/lp/google` — if so, auto-set `utm_source: "google"` and `utm_medium: "cpc"` when no UTM params are present (Google Ads clicks via syndicated search don't always carry UTMs).
- In `inferSourceType()`: Add detection for "syndicatedsearch" referrers → return "Google (paid)".

**2. `src/pages/admin/LeadSources.tsx` — `getSourceFromReferrer()` and `getMediumFromReferrer()`**
- `getSourceFromReferrer()`: Add check for "syndicatedsearch" hostname → return "google".
- `getMediumFromReferrer()`: Add check for "syndicatedsearch" hostname → return "cpc". Also add logic: if the lead's `landing_page` starts with `/lp/`, return "cpc" instead of inferring from referrer alone.
- Update paid lead counting to also include `medium === "cpc"` checks for syndicated leads.

**3. `src/pages/admin/Applications.tsx` — `getLeadSourceBadge()`**
- Add same syndicated search / `/lp/` detection so badges correctly show "Google (paid)" for these leads.

### Files Changed
- `src/lib/leadSourceTracking.ts` — auto-tag syndicated/lp leads as google cpc at capture time
- `src/pages/admin/LeadSources.tsx` — fix source/medium inference helpers
- `src/pages/admin/Applications.tsx` — fix badge display for syndicated/lp leads

