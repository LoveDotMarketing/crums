

## No-Index for `/lp/*` Landing Pages

The LinkedIn landing page at `/lp/linkedin` hasn't been built yet — it's part of the approved-but-not-yet-implemented plan. When it gets created, we need to ensure all `/lp/*` routes are excluded from search engine indexing.

### Changes

**1. `src/pages/LinkedInLanding.tsx`** (when created)
- Add `noindex={true}` to the `<SEO>` component — same pattern used on admin pages, login, etc.

**2. `public/robots.txt`** — Add a blanket disallow for the `/lp/` directory:
```
Disallow: /lp/
```
This prevents crawlers from indexing any current or future landing pages under `/lp/`.

**3. `public/sitemap.xml`** — Confirm no `/lp/` URLs are included (they currently aren't).

### Summary
Two lines of config: one `noindex` meta tag on the page component, one `Disallow` rule in robots.txt. Both are belt-and-suspenders to guarantee landing pages stay out of search indexes.

