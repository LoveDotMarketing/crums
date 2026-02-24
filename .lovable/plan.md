

# Add 48' Dry Van Trailer Dimensions Section

## What We're Doing

Adding a dedicated, detailed 48-foot dry van trailer dimensions section to the `/dry-van-trailers` page to capture search queries like "48 dry van dimensions", "48 foot trailer dimensions", and "48 ft dry van specs" that are appearing in both Google and Bing data.

## Changes

### 1. Update the SEO meta (lines 118-121)

Update the page title and description to include "48'" alongside "53'" so Google sees both sizes in the snippet:
- **Title:** `53' & 48' Dry Van Trailer Dimensions & Leasing | CRUMS`
- **Description:** `53' and 48' dry van interior dimensions, cubic feet, and pallet positions. 53'L x 8'6"W x 9'H (3,489 cu ft) | 48'L x 8'6"W x 9'H (3,165 cu ft). Lease from CRUMS - flexible terms.`

### 2. Expand the 48' card in "Available Configurations" (lines 249-281)

Add the missing spec details to the existing 48' card to match the 53' card's level of detail:
- Interior dimensions in both feet/inches and metric
- Cargo capacity: ~3,165 cubic feet
- Pallet positions: 24 standard pallets (48x40)
- Payload capacity: up to 44,000 lbs
- Door opening: 94" W x 102" H

### 3. Add a new "48' Dry Van Trailer Dimensions" deep-dive section

Insert a new section after the "Available Configurations" section with:
- An H2 heading: "48' Dry Van Trailer Dimensions & Specifications"
- A detailed HTML table comparing interior/exterior dimensions, weight, cubic footage, and pallet capacity
- A short paragraph explaining when to choose a 48' over a 53' (state length laws, urban delivery, lighter loads)
- Internal link to the leasing page with anchor text "Lease a 48-foot dry van trailer"

### 4. Add FAQ schema entries for 48' queries

Add two new FAQ items to the structured data and visible FAQ section:
- "What are the dimensions of a 48-foot dry van trailer?" -- full interior/exterior specs
- "How many pallets fit in a 48 foot trailer?" -- 24 pallets with explanation

### File Summary

| File | Change |
|---|---|
| `src/pages/DryVanTrailers.tsx` | Update meta title/description to include 48'; expand 48' config card with full specs; add dedicated 48' dimensions section with comparison table; add 2 new FAQ entries to schema and visible section |

