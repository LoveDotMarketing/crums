

# Improve Analytics Attribution for Organic Leads

## What's Missing

From the GA4 data on this lead, you can see the session timeline but **cannot confirm**:
- **Which page** they were on when they clicked to call (the `location` param says things like "hero" or "footer" but not the actual page URL)
- **How they found you** — no referrer or landing page is passed to GA4, even though `leadSourceTracking.ts` captures it in sessionStorage
- **Landing page URL** — stored locally but never sent as a GA4 dimension

## What to Fix

### 1. Enrich `trackPhoneClick` with page context
Add `page_path` (current URL) and `page_title` to every `phone_click` event so you always know which page converted.

### 2. Set GA4 User Properties for lead source on session start
After `captureLeadSource()` runs, send the referrer, landing page, and UTM params as GA4 **user properties** via `gtag('set', 'user_properties', {...})`. This attaches source data to every subsequent event in the session — including `phone_click`.

### 3. Add `page_path` to scroll depth and time-on-page events
These already send `page_name` but not the actual URL path, making it hard to correlate in GA4 reports.

## Files to Change

**`src/lib/analytics.ts`**
- Update `trackPhoneClick` to include `page_path: window.location.pathname` and `page_title: document.title`
- Add new `setLeadSourceUserProperties()` function that reads from sessionStorage and calls `gtag('set', 'user_properties', ...)`
- Add `page_path` param to `trackScrollDepth` and `trackTimeOnPage` milestone events

**`src/main.tsx`**
- Call `setLeadSourceUserProperties()` after `loadDeferredAnalytics()` (with a slight delay to ensure gtag is ready)

**`src/hooks/useTimeOnPageTracking.ts`**
- Include `page_path: window.location.pathname` in both milestone and final time events

**`src/hooks/useScrollDepthTracking.ts`**
- Include `page_path: window.location.pathname` in scroll depth events

## Result

Next time someone clicks to call, GA4 will show:
- The exact page URL they called from
- Their landing page and referrer (organic Google, direct, etc.)
- UTM params if they came from a campaign

