

## Add Missing Trailer 907028 and Update Counts to 20

### What happened
Trailer **907028** (VIN: `1GR1P0628VJ907028`) was deleted during the Guangyu cleanup and never re-added. This is the only missing unit from the 20-trailer fleet.

### Changes

**1. Insert trailer 907028 into the database**
- Same specs as the other 2027 Great Dane dry vans (company_id, make, model, type, rental_rate $700, status "available")
- VIN: `1GR1P0628VJ907028`
- Plate: `2450509` (from the image)

**2. Update "19" references to "20" in code**
- `src/pages/TrailerProfile2027GreatDane.tsx` — Update SEO description, hero subtitle, and badges from "19 units" to "20 units"

### Files changed
- **Database** — 1 trailer insert
- `src/pages/TrailerProfile2027GreatDane.tsx` — change "19" → "20" in 3 places

