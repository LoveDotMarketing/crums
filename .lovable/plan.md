

## Add Facebook Meta Pixel (ID: `1555487965511323`)

Follow the same deferred-loading pattern used for GA4 and LinkedIn.

### Changes

**1. `index.html`** — Add synchronous `fbq` stub (queues calls before script loads) alongside existing `gtag`/`lintrk` stubs. Add `<noscript>` fallback img in `<body>`.

**2. `src/lib/deferredAnalytics.ts`** — Load `https://connect.facebook.net/en_US/fbevents.js` after page load, then call `fbq('init', '1555487965511323')` and `fbq('track', 'PageView')`.

**3. `src/lib/analytics.ts`** — Add `trackFacebookEvent(eventName, params?)` helper.

**4. `src/pages/FacebookLanding.tsx`** — Fire `fbq('track', 'Lead')` on successful form submission.

**5. `src/pages/FacebookThankYou.tsx`** — Fire `fbq('track', 'Lead')` on page load as backup conversion.

