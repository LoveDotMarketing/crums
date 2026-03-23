

## Feature 2027 Great Dane Trailers on Homepage and Dry Van Leasing Page

### What changes

**1. Homepage — "Ready to Roll" section (`src/pages/Index.tsx`)**
- Change the current single-trailer layout (`max-w-4xl` with one card) to a 2-column grid
- Keep the existing 2020 Great Dane trailer 56171 card on the left
- Add a new 2027 Great Dane Champion Composite Plate card on the right with key specs from the PDF:
  - Year: 2027
  - Make: Great Dane
  - Model: Champion Composite Plate
  - Length: 53'
  - Height: 13'6"
  - Suspension: Hendrickson ULTRAAK Air-Ride
  - Doors: Composite Swing Doors
  - Floor: 1.38" Hardwood Laminated
  - Side Skirts: Energy Guard
  - Telematics: FleetPulseGo Track
- The new card links to `/get-started` (or `/contact`) since it's a fleet of 19 units, not a single profile page
- Badge: "New 2027 Fleet" or "New Arrival"

**2. Dry Van Leasing page — New "Available Now" section (`src/pages/DryVanTrailerLeasing.tsx`)**
- Add a new section after the hero (before "Why Lease a Dry Van") titled "Available Dry Van Trailers" or "Our Fleet"
- Show two cards side by side:
  - The 2020 Great Dane 56171 (linking to its profile page)
  - The 2027 Great Dane Champion Composite Plate fleet (with specs, linking to `/contact` or `/get-started`)
- Each card shows key specs and an "Available Now" badge

### Technical details

**Files changed:**
- `src/pages/Index.tsx` — Restructure "Ready to Roll" section from single card to 2-column grid, add 2027 Dane card with specs
- `src/pages/DryVanTrailerLeasing.tsx` — Add new "Available Dry Van Trailers" section between hero/breadcrumbs and "Why Lease" section, featuring both trailers

The 2027 Dane card will use a generic dry van image (`/images/dry-van-trailer.webp`) since no specific photo was provided. Specs are pulled directly from the Great Dane spec sheet (Order #176075).

