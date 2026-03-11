

# Strengthen Nationwide Delivery Messaging on Non-Pickup Location Pages

## Problem
The delivery section for far-away locations (Columbus, Charlotte, Denver, Indianapolis, etc.) uses generic language like "reliable trailer delivery" without emphasizing **nationwide delivery from Texas at competitive prices** — the exact value prop that converted the Ohio caller.

## Changes

### `src/components/LocationPageTemplate.tsx`

Update the non-pickup delivery section (the `else` branch starting ~line 238) to emphasize nationwide reach and Texas pricing:

1. **Hero subtitle** (line 178): Change from generic "We deliver commercial trailers directly to {city}" to "**Nationwide delivery from Texas** — quality trailers at competitive Texas prices, delivered directly to your {city} location."

2. **Delivery section heading** (line 208): Change from "Trailer Delivery to {city}" to "Nationwide Delivery to {city} — Straight from Texas"

3. **Delivery section body** (lines 238-261): Replace the generic copy with stronger messaging:
   - Lead with "We deliver trailers **nationwide** from our San Antonio, TX headquarters — and {city} is one of the markets we proudly serve."
   - Replace the 3 bullet points with more compelling ones:
     - "**Nationwide delivery** — from Texas to {city} and everywhere in between"
     - "**Texas-based pricing** — often lower than local competitors in {stateAbbr}"
     - "Flexible scheduling to meet your timeline"
     - "GPS-equipped trailers for peace of mind"

4. **FAQ section**: Update the delivery FAQ answer (~line 500 area) to mention "nationwide delivery" explicitly for non-pickup locations.

### `src/lib/locations.ts`

Update `metaDescription` for far-away locations that don't already stress delivery/pricing:
- **Charlotte**: Add "Nationwide delivery from Texas at competitive rates"
- **Denver**: Add "Delivered from Texas at competitive rates"
- **Kansas City**: Add "Delivered from Texas"
- **Indianapolis**: Add "Texas prices, delivered"
- **Chicago**: Add "Delivered nationwide from Texas"

These are the non-TX, non-pickup locations whose meta descriptions currently lack the delivery + pricing angle that Columbus already has.

## Files
- `src/components/LocationPageTemplate.tsx` — update delivery messaging for all non-pickup pages
- `src/lib/locations.ts` — update meta descriptions for 5 existing far-away locations

