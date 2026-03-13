

## Internal Link Audit for `/commercial-dry-van-trailer-for-lease-56171`

### Current State

The trailer profile page currently receives internal links from only **2 pages**:
1. **Homepage (`Index.tsx`)** — Featured trailer card
2. **Dry Van Trailers (`DryVanTrailers.tsx`)** — Available trailer listing

That's very thin link equity for a high-intent money page.

### Plan: Add contextual links from 8 high-authority pages

Each link will be a natural, contextual mention — not forced. The trailer profile serves as a "see it before you lease it" proof point.

| # | Page | Placement | Anchor Text |
|---|------|-----------|-------------|
| 1 | **DryVanTrailerLeasing.tsx** | Near the CTA section (~line 357) | "See our 2020 Great Dane dry van trailer available now" |
| 2 | **SemiTrailerLeasing.tsx** | In the equipment section | "View a trailer profile — Unit 56171" |
| 3 | **FleetSolutions.tsx** | Equipment quality section | "See a sample trailer from our fleet" |
| 4 | **TrailerLeasing.tsx** | Available equipment section | "Browse our 2020 Great Dane dry van" |
| 5 | **TrailerRentals.tsx** | Cross-sell section | "Check out this dry van trailer available for lease" |
| 6 | **LocationPageTemplate.tsx** | Equipment section (all 24 city pages get the link) | "View available trailers like our 2020 53' dry van" |
| 7 | **WhyChooseCrums.tsx** | Quality/inspection section | "See a fully inspected trailer — Unit 56171" |
| 8 | **Footer.tsx** | Under Services column | "Available Trailers" |

### Implementation

- Each page gets 1-2 lines added: a `<Link>` with keyword-rich anchor text placed in a contextually relevant section
- Footer link gives site-wide coverage across all pages
- LocationPageTemplate link multiplies across 24 city pages automatically
- No new components or routes needed — just adding `<Link to="/commercial-dry-van-trailer-for-lease-56171">` in appropriate spots

### Impact

- From **2 linking pages** to **~34+ linking pages** (8 templates, with LocationPageTemplate covering 24 cities)
- Footer link adds site-wide authority signal
- All links use varied, keyword-rich anchor text for natural link profile

