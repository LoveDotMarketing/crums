

# SEO Audit: Fixes for Sitemap, Meta Titles, Schema, Internal Linking & Delivery Messaging

## Issues Found

### 1. Double "CRUMS Leasing" in page titles (all location pages)
Every location entry has `metaTitle: "Trailer Rental Philadelphia PA | Texas Prices, Delivered | CRUMS Leasing"`, but the SEO component appends `| CRUMS Leasing` again. Result in Google: **"Trailer Rental Philadelphia PA | Texas Prices, Delivered | CRUMS Leasing | CRUMS Leasing"**. This affects all 24 location pages.

**Fix**: Remove `| CRUMS Leasing` from every `metaTitle` in `src/lib/locations.ts`. The SEO component handles the brand suffix automatically.

### 2. Broken sitemap URL
`/resources/guides/load-boards` in sitemap, but actual route is `/resources/guides/load-boards-guide`. Google is indexing a dead URL.

**Fix**: Update sitemap entry to match the real route.

### 3. No images on location pages (missing alt text opportunity)
The `LocationPageTemplate` has zero `<img>` elements — no hero image, no trailer photos. This is a missed SEO signal (image search, alt text, visual engagement).

**Fix**: Add a trailer fleet image to the hero section and a delivery/map image to the delivery section, both with city-specific alt text like `"Dry van trailer for lease delivered to Philadelphia PA"`.

### 4. Schema enhancement for non-TX pages
The Service schema says "Commercial Trailer Rental" but doesn't mention nationwide delivery or Texas pricing. For out-of-state pages, the schema should include delivery as a distinct service offering.

**Fix**: For non-pickup pages, add `"availableChannel"` with delivery details and enhance the description to include "delivered from Texas at competitive rates".

### 5. Internal linking: Location pages don't link to `/locations` hub
The location template links to leasing pages, tools, and guides, but has no explicit link back to the `/locations` hub page (only breadcrumbs). Adding a visible link strengthens the hub-and-spoke model.

**Fix**: Add a "View All Locations" link in the Nearby Cities section.

### 6. FAQ missing delivery/pricing question for out-of-state pages
The FAQ schema has 4 questions but none directly ask "Why is it cheaper to lease from Texas?" — the core value prop. Adding this as a 5th FAQ for non-TX pages strengthens the Texas pricing message in rich results.

**Fix**: Add a 5th FAQ item for non-pickup pages: "Why are CRUMS' Texas prices lower than local {city} rates?"

## Files to Change

| File | Changes |
|------|---------|
| `src/lib/locations.ts` | Remove `\| CRUMS Leasing` from all 24 `metaTitle` values |
| `src/components/LocationPageTemplate.tsx` | Add hero image with alt text, delivery image, "View All Locations" link, 5th FAQ for non-TX, enhanced schema |
| `public/sitemap.xml` | Fix load-boards URL |

## Scope
- 3 files modified
- No new pages or routes
- All changes are SEO-focused (meta, schema, images, internal linking)

