

# SEO Audit: Title, Meta Description & H1 Alignment Across All Pages

## Issues Found

### 1. Double "CRUMS Leasing" in Titles (5 remaining pages)
These pages still manually include the brand suffix that the SEO component auto-appends:

| Page | Current Title |
|------|--------------|
| Reviews | `Customer Reviews \| CRUMS Leasing Trailer Testimonials` |
| DryVanTrailers | `53' & 48' Dry Van Trailer Dimensions & Leasing \| CRUMS` |
| Locations | `Trailer Rental Locations \| Nationwide Delivery \| CRUMS` |
| GetStarted (step 2) | `Account Created - CRUMS Leasing` |
| GetStarted (step 3) | `Complete Your Application - CRUMS Leasing` |

**Fix**: Remove the brand suffix from all 5.

### 2. Title ↔ H1 Mismatch (keyword dilution)
When the `<title>` targets one keyword but the `<h1>` says something different, Google gets mixed signals. These pages have significant mismatches:

| Page | Title (in tab) | H1 (on page) | Problem |
|------|---------------|--------------|---------|
| Index | "Dry Van & Flatbed Trailer Leasing in Texas" | "Empowering Every Carrier To Build the Life They're Proud Of" | H1 is brand-emotional, zero keywords |
| Services | "Trailer Leasing, Rentals & Fleet Solutions" | "Our Services" | H1 is generic |
| Contact | "Contact Us - Get A Quote" | "Contact Us" | H1 misses "trailer leasing quote" |
| Reviews | "Customer Reviews \| CRUMS Leasing..." | "Customer Reviews" | H1 misses product terms |
| LeaseToOwn | "Lease to Own a Trailer..." | "Every Payment Brings You Closer to Ownership" | H1 misses "lease to own" keyword |
| TrailerRentals | "Trailer Rentals - Short-Term 53-Foot..." | "Trailer Rental Solutions" | H1 loses "53-foot dry van" |
| Locations | "Trailer Rental Locations..." | "Trailer Rental Locations" | Misses "53' dry van" |

**Fix**: Align H1s to echo the primary keyword from the title while keeping them natural.

### 3. Meta Descriptions Missing Product Specifics (4 pages)
These descriptions don't mention "53' dry van" or "flatbed":

| Page | Current Description |
|------|-------------------|
| Services | "Explore CRUMS Leasing services including long-term trailer leasing..." (generic) |
| Contact | "Contact CRUMS Leasing for trailer leasing and rental quotes..." (generic) |
| About | "Learn about CRUMS Leasing's family-rooted legacy..." (no products) |
| Locations | "CRUMS Leasing delivers trailers nationwide..." (no product sizes) |

**Fix**: Inject "53' dry van and flatbed trailers" into each description.

## Changes

| File | What |
|------|------|
| `src/pages/Index.tsx` | Add keyword subtitle to H1 (keep emotional line, add product line) |
| `src/pages/Services.tsx` | H1 → "53' Dry Van & Flatbed Trailer Leasing, Rentals & Fleet Solutions"; meta desc update |
| `src/pages/Contact.tsx` | H1 → "Contact Us for a 53' Dry Van or Flatbed Trailer Quote"; meta desc update |
| `src/pages/About.tsx` | Meta desc update to include products |
| `src/pages/Reviews.tsx` | Fix double title; H1 → "Customer Reviews — 53' Dry Van & Flatbed Trailer Leasing" |
| `src/pages/LeaseToOwn.tsx` | H1 → "Lease to Own a 53' Dry Van Trailer" |
| `src/pages/TrailerRentals.tsx` | H1 → "53' Dry Van & Flatbed Trailer Rentals" |
| `src/pages/Locations.tsx` | Fix double title; H1 → "53' Dry Van & Flatbed Trailer Rental Locations"; meta desc update |
| `src/pages/DryVanTrailers.tsx` | Fix double title |
| `src/pages/GetStarted.tsx` | Fix double title on steps 2 & 3 |

10 files, no new routes, no schema changes (schema is solid across the board).

