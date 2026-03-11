

# SEO Audit: Gaps Found Across All Pages

## Issue 1: Double "CRUMS Leasing" in Titles (9 public pages)
The SEO component appends `| CRUMS Leasing` automatically. These pages include it manually, producing doubled branding in Google results:

| Page | Current Title |
|------|--------------|
| Industries hub | `Industries We Serve | ... | CRUMS Leasing` |
| Fleet Leasing | `Fleet Leasing Solutions | CRUMS Leasing` |
| Owner Operators | `Owner Operator Trailer Leasing | CRUMS Leasing` |
| Logistics Companies | `Logistics Company Trailer Solutions | CRUMS Leasing` |
| Food Distribution | `Food Distribution Trailer Leasing | CRUMS Leasing` |
| Retail Distribution | `Retail Distribution Trailer Leasing | CRUMS Leasing` |
| Manufacturing | `Manufacturing Logistics Trailer Leasing | CRUMS Leasing` |
| Seasonal Demand | `Seasonal Trailer Rentals | CRUMS Leasing` |
| Emergency Rental | `Emergency Trailer Rental | Same-Day Response | CRUMS Leasing` |
| Partners | `Partners | CRUMS Leasing` |

**Fix**: Strip `| CRUMS Leasing` from all 10 titles.

## Issue 2: Industry Pages Have No FAQ Schema (7 pages)
Location pages all have FAQ schema with 5 items (including the Texas pricing question). Industry pages have zero FAQ schema -- missing rich result opportunity.

**Fix**: Add FAQ schema to all 7 industry pages with 3 relevant questions each (including one about 53' dry van and flatbed availability for that industry).

## Issue 3: FleetSolutions and Mission Have Minimal Schema
Both pages only pass breadcrumb schema. FleetSolutions is a money page that should have a Service schema. Mission should have an Organization schema.

**Fix**: Add Service schema to FleetSolutions, Organization schema to Mission.

## Issue 4: Industry Pages Don't Mention Core Products in Titles
Location pages now target "53' Dry Van Trailer" in titles. Industry pages still use generic terms like "Fleet Leasing Solutions" and "Logistics Company Trailer Solutions" without naming the actual products.

**Fix**: Update industry page titles to include "53' Dry Van & Flatbed" where natural. Example: `"Fleet Leasing — 53' Dry Van & Flatbed Trailers"`.

## Issue 5: Sitemap-Index lastmod is Stale
`sitemap-index.xml` shows `lastmod: 2026-02-06` for the main sitemap, but we've added pages since then (3 new cities on 2026-03-11).

**Fix**: Update sitemap-index.xml lastmod to `2026-03-11`.

## Changes

| File | What |
|------|------|
| `src/pages/industries/FleetLeasing.tsx` | Fix double title, add FAQ schema, add product keyword |
| `src/pages/industries/OwnerOperators.tsx` | Fix double title, add FAQ schema, add product keyword |
| `src/pages/industries/LogisticsCompanies.tsx` | Fix double title, add FAQ schema, add product keyword |
| `src/pages/industries/FoodDistribution.tsx` | Fix double title, add FAQ schema, add product keyword |
| `src/pages/industries/RetailDistribution.tsx` | Fix double title, add FAQ schema, add product keyword |
| `src/pages/industries/Manufacturing.tsx` | Fix double title, add FAQ schema, add product keyword |
| `src/pages/industries/SeasonalDemand.tsx` | Fix double title, add FAQ schema, add product keyword |
| `src/pages/Industries.tsx` | Fix double title |
| `src/pages/EmergencyTrailerRental.tsx` | Fix double title |
| `src/pages/Partners.tsx` | Fix double title |
| `src/pages/FleetSolutions.tsx` | Add Service schema |
| `src/pages/Mission.tsx` | Add Organization schema |
| `public/sitemap-index.xml` | Update lastmod |

13 files, no new routes.

