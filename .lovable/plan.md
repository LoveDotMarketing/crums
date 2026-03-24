

## Fix Poor Contrast on "View Specs & Dimensions" Buttons

### Problem
The "View Specs & Dimensions" outline buttons on the Dry Van and Flatbed leasing hero sections use `border-primary-foreground text-primary-foreground` with a transparent background on a dark teal gradient. This creates a near-invisible white-on-dark outline button with poor contrast and readability.

The Semi Trailer Leasing page doesn't have this secondary CTA at all — it only has the orange "Get A Lease Quote" button.

### Fix

Change the outline buttons to use a solid white background with dark text for clear contrast against the teal hero:

**Files: `src/pages/DryVanTrailerLeasing.tsx` and `src/pages/FlatbedTrailerLeasing.tsx`**
- Replace `variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"`
- With `className="bg-white text-primary hover:bg-white/90 border-white"`
- This gives a solid white button with teal text — high contrast, clear CTA

**File: `src/pages/SemiTrailerLeasing.tsx`**
- Add the same "View Specs & Dimensions" secondary button next to the existing orange CTA for consistency across all three service pages
- Link to `/dry-van-trailers` (or a general specs page)

### Files changed
- `src/pages/DryVanTrailerLeasing.tsx` — update button styling
- `src/pages/FlatbedTrailerLeasing.tsx` — update button styling
- `src/pages/SemiTrailerLeasing.tsx` — add matching secondary CTA button

