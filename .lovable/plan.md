

## Plan: Remove 48' Dry Van References & Replace Hector Photo

### Two issues to fix

**1. Remove all 48' Dry Van content from the site**
You don't offer 48' dry vans. These references appear in:

- **`src/pages/DryVanTrailers.tsx`** — 48' Dry Van spec card (lines 265-297), entire 48' dimensions deep-dive section (lines 302-370+), SEO title/description mentioning 48', hero text, and comparison table
- **`src/pages/DryVanTrailerLeasing.tsx`** — Hero text and schema description mentioning "53' and 48'"
- **`src/pages/resources/guides/MaintenanceSchedules.tsx`** — One reference to "48-foot flatbeds" (this is about flatbeds, not dry vans, so likely fine to keep)

Changes: Remove the 48' Dry Van card, the entire 48' dimensions section, and update all page titles/descriptions/hero text to reference only 53' dry vans.

**2. Replace the Hector photo on Trailer Leasing page**
- **`src/pages/TrailerLeasing.tsx`** line 13 — uses `/images/crums-leasing-trailer-pickup.webp` which shows Hector
- Replace this image with a different trailer/yard photo, or remove the image section entirely

### What I need from you
- For the Hector photo: should I remove the image entirely, or do you have a replacement photo to upload?

### Files to modify
- `src/pages/DryVanTrailers.tsx` — Remove 48' dry van card, specs section, update SEO/hero text
- `src/pages/DryVanTrailerLeasing.tsx` — Update hero and schema to 53' only
- `src/pages/TrailerLeasing.tsx` — Replace or remove the Hector photo

