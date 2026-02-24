

# Internal Link Audit: Redirect Link Equity to Money Pages

## Problem

There are still **12 files** linking to the generic `/services/trailer-leasing` page instead of the three commercial leasing hubs (`/dry-van-trailer-leasing`, `/flatbed-trailer-leasing`, `/semi-trailer-leasing`). Every link to the generic page dilutes authority from the money pages that should be ranking.

## Changes

### 1. Navigation (desktop + mobile) -- `src/components/Navigation.tsx`

Replace the single "Trailer Leasing" dropdown item pointing to `/services/trailer-leasing` with three specific entries:
- Dry Van Leasing --> `/dry-van-trailer-leasing`
- Flatbed Leasing --> `/flatbed-trailer-leasing`  
- Semi Trailer Leasing --> `/semi-trailer-leasing`

Same change for the mobile menu (line 270).

### 2. Footer -- `src/components/Footer.tsx`

Remove the generic "Trailer Leasing" link (line 93) that still points to `/services/trailer-leasing`. The three specific hub links are already present below it.

### 3. Remaining page-level links (swap `/services/trailer-leasing` to specific hubs)

| File | Current Link Text | New Target |
|---|---|---|
| `src/pages/Contact.tsx` (line 433) | "53-foot dry van trailer leasing" | `/dry-van-trailer-leasing` |
| `src/pages/About.tsx` (line 273) | "Trailer Leasing" card | `/dry-van-trailer-leasing` (primary product) |
| `src/pages/Mission.tsx` (line 285) | "trailer leasing services" | `/dry-van-trailer-leasing` |
| `src/pages/Reviews.tsx` (line 346) | "Trailer leasing services" | `/dry-van-trailer-leasing` |
| `src/pages/Locations.tsx` (line 311) | "trailer leasing options" | `/dry-van-trailer-leasing` |
| `src/pages/FleetSolutions.tsx` (line 273) | "individual trailer leasing" | `/dry-van-trailer-leasing` |
| `src/pages/TrailerRentals.tsx` (line 222) | "long-term trailer leasing programs" | `/dry-van-trailer-leasing` |
| `src/pages/DryVanTrailers.tsx` (line 686) | "View All Leasing Options" button | `/dry-van-trailer-leasing` |
| `src/pages/FlatbedTrailers.tsx` (line 460) | "View All Leasing Options" button | `/flatbed-trailer-leasing` |
| `src/components/TrailerProfileTemplate.tsx` (line 417) | Leasing button | `/dry-van-trailer-leasing` |

### 4. Redirect route -- `src/App.tsx`

Update the `/refrigerated-trailers` redirect (line 200) from `/services/trailer-leasing` to `/dry-van-trailer-leasing`.

## Summary

- **13 files** updated
- Every remaining `/services/trailer-leasing` link replaced with a specific hub link
- Net result: the three money pages receive the vast majority of internal link equity site-wide
- The generic `/services/trailer-leasing` page still exists but is no longer linked from anywhere -- it becomes a legacy URL only

