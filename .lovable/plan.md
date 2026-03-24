

## Update 2027 Great Dane Flatbed Profile with Verified Specs

### What needs to change

The current profile page is missing the 53' length and has inaccurate tie-down info. Updating based on VIN decode + bill of lading data.

### Changes

**File: `src/pages/TrailerProfile2027GreatDaneFlatbed.tsx`**

1. Add **Length: 53'** spec row
2. Update **Model** from "Great Dane Flatbed" → "Great Dane FLP-0024-00053"
3. Update **Tie-Downs** from "Multiple D-Rings & Stake Pockets" → "12 Winches & Tie Straps"
4. Add **Axles: 2** spec row
5. Add **Color: Black** spec row
6. Add **Trailer Type: Kingpin** spec row
7. Update features list to reflect 53' length and 12 winches/straps
8. Update SEO description to include "53-foot"

**Database: Update trailer record for 901015**
- Set `model` to `FLP-0024-00053` if not already set
- Set `length` or notes with 53' if applicable

### Files changed
- `src/pages/TrailerProfile2027GreatDaneFlatbed.tsx` — update specs, features, SEO
- Database — update trailer 901015 model info

