

## Plan: Remove Remaining 48' Dry Van References

The previous cleanup missed several pages. Here are all remaining 48' **dry van** references to fix (48' flatbed references are correct and stay).

### Files to modify

**1. `src/pages/SemiTrailerLeasing.tsx`**
- Line 40: FAQ answer mentions "53-foot and 48-foot dry van trailers" → change to "53-foot dry van trailers"
- Line 117: "Enclosed 53' and 48' trailers" → "Enclosed 53' trailers"
- Line 120: Remove "53' and 48' lengths" from the dry van feature list, replace with "53' length"

**2. `src/pages/DryVanTrailerLeasing.tsx`**
- Line 365: "DOT-inspected 53' or 48' trailer" → "DOT-inspected 53' trailer"

**3. `src/pages/TrailerLeasing.tsx`**
- Line 155: "53' and 48' options" → "53' lengths available" (this is under dry van section)

### References that stay (flatbed-related, correct)
- `FlatbedTrailers.tsx` — 48' deck length is accurate for flatbeds
- `TrailerLeasing.tsx` line 191 — "48-foot lengths available" is under the flatbed section
- `GetStarted.tsx` / `Application.tsx` — "48' Flatbed" as a trailer type option
- `MaintenanceSchedules.tsx` — "48-foot flatbeds" reference

