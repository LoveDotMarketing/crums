
# Add Leasing Hub Links to the Homepage

## Problem
The homepage currently links to generic service pages and informational trailer spec pages, but has no links to the new high-intent commercial leasing hubs (`/dry-van-trailer-leasing`, `/flatbed-trailer-leasing`, `/semi-trailer-leasing`). These are the money pages the entire SEO strategy funnels toward.

## Changes

### File: `src/pages/Index.tsx`

**1. Update the "Trailer Types" cluster (lines 282-299)**

Add the three leasing hub links below the existing spec page links, so users see both dimensions/specs and leasing options:

- Dry Van Trailer Leasing --> `/dry-van-trailer-leasing`
- Flatbed Trailer Leasing --> `/flatbed-trailer-leasing`
- Semi Trailer Leasing --> `/semi-trailer-leasing`

**2. Update the "Services" cluster (lines 256-279)**

Replace the generic `/services/trailer-leasing` link with the specific hub, or add the three leasing hubs as sub-links beneath the existing "Trailer Leasing" entry to pass more link equity to the money pages.

Updated structure:
- Dry Van Leasing --> `/dry-van-trailer-leasing`
- Flatbed Leasing --> `/flatbed-trailer-leasing`
- Semi Trailer Leasing --> `/semi-trailer-leasing`
- Trailer Rentals (keep as-is)
- Fleet Solutions (keep as-is)

This mirrors the footer structure that was already updated in the previous round.

### Summary

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Replace generic trailer leasing link in Services cluster with 3 specific hub links; add leasing links to Trailer Types cluster |
