

# SEO: Product-Specific Optimization for All Location Pages

## Problem
The location pages use generic "Trailer Rental" in titles and headings. They should target **"53 foot dry van trailer near [City]"** and **"flatbed trailer near [City]"** — the exact products you sell. Several metaDescriptions also omit product specifics entirely (LA, Atlanta, Memphis, Nashville).

## Audit Summary

| Issue | Pages Affected |
|-------|---------------|
| metaTitle missing "Dry Van" keyword | All 24 pages |
| h1 generic "Trailer Rental & Leasing" | All 24 pages |
| metaDescription missing "53' dry van & flatbed" | LA, Atlanta, Memphis, Nashville (4 pages) |
| Hero/delivery copy doesn't name specific products | Template (all pages) |

## Changes

### 1. `src/lib/locations.ts` — All 24 entries

**metaTitle** — Shift primary keyword to "Dry Van Trailer":
- Before: `"Trailer Rental Dallas TX | Delivery Available"`
- After: `"53' Dry Van Trailer Rental Dallas TX | Flatbed Available"`
- Non-TX pattern: `"53' Dry Van Trailer Near [City] [ST] | Texas Prices, Delivered"`
- TX pickup pattern: `"53' Dry Van Trailer Rental [City] TX | Local Pickup"`

**h1** — Include product names:
- Before: `"Trailer Rental & Leasing in Dallas, Texas"`
- After: `"53' Dry Van & Flatbed Trailer Rental in Dallas, Texas"`

**metaDescription** — Fix 4 pages missing product specifics (LA, Atlanta, Memphis, Nashville) to include "53' dry van & flatbed trailers".

### 2. `src/components/LocationPageTemplate.tsx` — Template updates

**Hero subtitle** — Mention products explicitly:
- Pickup: "Pick up a 53-foot dry van or flatbed trailer at our Bulverde, TX yard..."
- Delivery: "53-foot dry van trailers and flatbed trailers at competitive Texas prices, delivered directly to your [City] location."

**Delivery section h2** — Product-specific:
- Before: "Nationwide Delivery to [City] — Straight from Texas"
- After: "53' Dry Van & Flatbed Trailers Delivered to [City] from Texas"

**Delivery bullet points** — Add product line:
- Add: "53-foot dry van trailers and flatbed trailers — our core fleet"

**CTA section** — Product mention:
- "Contact us today for a free quote on 53' dry van or flatbed trailer rental in [City], [ST]."

**Schema description** — Already mentions products, no change needed.

### Files
- `src/lib/locations.ts` — Update metaTitle, h1, and 4 metaDescriptions across all 24 entries
- `src/components/LocationPageTemplate.tsx` — Update hero, delivery, and CTA copy

