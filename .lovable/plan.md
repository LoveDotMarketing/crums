

## Add 2027 Great Dane Flatbed Trailer to Fleet, Homepage, and Flatbed Pages

### What will happen

**1. Add trailer to fleet inventory (database insert)**
- VIN: 1GR4M0626VH901015
- Trailer number: 901015 (last 6 digits of VIN, matching existing pattern)
- Make: Great Dane, Year: 2027, Type: Flatbed
- Status: available, rental_rate: $750
- License plate: 560-5676

**2. Copy uploaded photos to project**
- Copy the 3 flatbed photos to `public/images/trailers/` for use on the profile page and homepage

**3. Create trailer profile landing page**
- New file: `src/pages/TrailerProfile2027GreatDaneFlatbed.tsx`
- Uses `TrailerProfileTemplate` (same pattern as 2027 dry van and 56171)
- URL: `/2027-great-dane-flatbed-trailer-for-lease`
- Specs: 2027 Great Dane Flatbed, aluminum deck, air-ride suspension
- Gallery: the 3 uploaded photos
- SEO-optimized title/description

**4. Add route in `src/App.tsx`**
- Lazy-load the new flatbed profile page

**5. Update Homepage "Ready to Roll" section (`src/pages/Index.tsx`)**
- Change from 2-column to 3-column grid (lg:grid-cols-3)
- Add a third card for the 2027 Great Dane Flatbed with photo, specs, and link to its profile page

**6. Update Flatbed Trailer Leasing page (`src/pages/FlatbedTrailerLeasing.tsx`)**
- Add an "Available Flatbed Trailers" section (similar to the dry van leasing page's "Available Now" section)
- Feature the 2027 flatbed with specs and link to profile page

**7. Update Flatbed Trailers page (`src/pages/FlatbedTrailers.tsx`)**
- Add a featured/available trailer section showcasing the 2027 flatbed

### Files changed
- **Database** — insert 1 trailer record
- `public/images/trailers/` — 3 new flatbed photos
- `src/pages/TrailerProfile2027GreatDaneFlatbed.tsx` — new profile page
- `src/App.tsx` — add route
- `src/pages/Index.tsx` — add flatbed card to "Ready to Roll" grid
- `src/pages/FlatbedTrailerLeasing.tsx` — add available trailer section
- `src/pages/FlatbedTrailers.tsx` — add available trailer section

