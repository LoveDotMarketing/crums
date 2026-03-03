

## Review: Public-Facing Offering Mentions

### Current State

| Offering | Mentioned on Public Pages? | Details |
|----------|---------------------------|---------|
| **Trailer Leasing** | Yes — extensively | Homepage, Services, Dry Van Leasing, Flatbed Leasing, Semi Trailer Leasing, Fleet Solutions, industry pages, FAQs |
| **Rent for Storage** | **No** — only in admin/customer dashboards | Zero mentions on any public marketing page |
| **Lease to Own** | **No** — only in admin/customer dashboards | Zero mentions on any public marketing page |

### What Needs to Happen

Both **Rent for Storage** and **Lease to Own** are fully built in the backend and customer portal but are completely invisible to prospects on the public site. They should be surfaced on key conversion pages.

### Plan

1. **Services page** (`src/pages/Services.tsx`) — Add "Lease to Own" and "Rent for Storage" as two new service cards alongside the existing Trailer Leasing, Trailer Rentals, and Fleet Solutions cards

2. **Homepage** (`src/pages/Index.tsx`) — Add a "More Ways to Work With Us" section (or similar) near the bottom with brief descriptions and links for Lease to Own and Rent for Storage

3. **Trailer Leasing page** (`src/pages/TrailerLeasing.tsx`) — Add a section mentioning both options as alternative arrangements available through CRUMS

4. **FAQ updates** — Add 1-2 FAQ entries on the homepage covering "Do you offer lease-to-own?" and "Can I rent a trailer for storage?"

5. **Structured data** — Add service schema entries for both offerings

