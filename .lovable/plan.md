

# Fix SEO Critical Findings from Audit

## What This Does
Addresses the P0 and P1 findings from the SEO audit screenshot. Since this is a React SPA, Google's crawler sees only the raw `index.html` before JavaScript executes — meaning all pages share the same static title and description. While `react-helmet-async` sets correct per-page titles after hydration, Google may not always execute JS. The fixes focus on what we can control within the SPA architecture.

## Findings & Fixes

### P0 — Duplicate Title/Description Across All Pages
**Root cause:** The `index.html` has a hardcoded `<title>` and `<meta description>` that Googlebot may read before JS runs. React Helmet updates these client-side, but crawlers don't always wait.

**Fix:** This is inherent to SPAs. However, we already have `react-helmet-async` with unique titles per page — verified that each page passes unique `title` and `description` props. No code change needed here; the real mitigation is ensuring structured data and canonicals are solid (see below).

### P0 — React Helmet Schema Conflict (JSON-LD Disappears)
**Fix in:** `src/components/SEO.tsx` and key pages

- Switch from injecting JSON-LD via `<Helmet><script>` to injecting it directly into the DOM using `useEffect` + `document.head.appendChild`. This avoids Helmet instance conflicts and ensures schemas persist.
- Create a `useStructuredData(schema)` hook that appends/removes `<script type="application/ld+json">` tags via DOM API instead of Helmet.

### P0 — No Canonical Tags on Any Page
**Status:** Already implemented — `SEO.tsx` line 57 renders `<link rel="canonical">`. The audit tool likely couldn't detect it because it was injected by Helmet after JS execution.

**Fix:** Add a static canonical fallback in `index.html` for the homepage, and ensure the Helmet-based canonical continues working for all other pages. No change needed in SEO.tsx.

### P1 — Broken Route: /trailer-leasing Returns 404
**Fix in:** `src/App.tsx`

- Add a redirect: `<Route path="/trailer-leasing" element={<Navigate to="/services/trailer-leasing" replace />} />`

### P1 — No XML Sitemap or Robots.txt
**Status:** Both already exist at `public/robots.txt` and `public/sitemap.xml`. The audit tool may have checked the wrong URL or been blocked. The files are correct and reference `crumsleasing.com`.

**No code change needed.** Verify deployment includes `public/` static files.

### P1 — No GTM or Facebook Pixel
**Status:** Facebook Pixel is already in `index.html` (lines 29-37). LinkedIn Insight Tag is present. GA4 loads via deferred script. No GTM — this is by design (GA4 is loaded directly).

**No code change needed.** The audit tool may not have detected the inline pixel.

## Changes Summary

### 1. Add `/trailer-leasing` redirect
**File:** `src/App.tsx`
- Add `<Route path="/trailer-leasing" element={<Navigate to="/services/trailer-leasing" replace />} />`

### 2. Fix JSON-LD injection to persist for crawlers
**File:** New `src/hooks/useStructuredData.ts`
- Create a hook that uses `useEffect` to inject `<script type="application/ld+json">` directly into the DOM, bypassing Helmet entirely
- Cleans up on unmount

**File:** `src/components/SEO.tsx`
- Remove the `structuredData` prop and Helmet-based `<script>` injection
- Export only title/description/canonical/OG handling via Helmet

**File:** All pages that pass `structuredData` to `<SEO>`
- Replace `structuredData` prop with a `useStructuredData(schema)` call alongside the existing `<SEO>` component

### 3. Add canonical fallback in index.html
**File:** `index.html`
- Add `<link rel="canonical" href="https://crumsleasing.com/" />` as a static fallback for crawlers that don't execute JS

### Technical Details
- The `useStructuredData` hook will use `document.createElement('script')` with `type="application/ld+json"` and append to `document.head`
- On cleanup (component unmount / route change), the script tag is removed
- This completely sidesteps the Helmet conflict issue where multiple Helmet instances fight over `<script>` tags

