

# Add 5 New Location Pages with Nationwide Delivery + Texas Pricing Focus

## What's Missing
The 5 location pages from the earlier plan were never created. Only the `LocationPageTemplate` messaging was updated. We need to add: **Philadelphia (PA), Jacksonville (FL), Richmond (VA), Des Moines (IA), Portland (OR)**.

All will emphasize: **"Save with lower Texas prices — delivered nationwide to your yard."**

## Changes

### 1. `src/lib/locations.ts`

Add 5 new entries after the Columbus entry. Each one:
- `isPickupFriendly: false` — triggers the updated nationwide delivery template messaging
- `metaDescription` leads with Texas pricing + nationwide delivery angle
- Local landmarks, highways, and industries for SEO authority

| City | Slug | Distance | Key Highways | Key Industries | Nearby Cross-links |
|------|------|----------|-------------|----------------|-------------------|
| Philadelphia, PA | `philadelphia-pa` | ~1,750mi | I-76, I-95, I-476, PA Turnpike | Pharma distribution, retail, e-commerce fulfillment, port logistics | `charlotte-nc`, `columbus-oh` |
| Jacksonville, FL | `jacksonville-fl` | ~1,000mi | I-95, I-10, I-295 | Port logistics, import/export, cold chain, distribution | `atlanta-ga`, `charlotte-nc` |
| Richmond, VA | `richmond-va` | ~1,500mi | I-95, I-64, I-85, I-295 | Distribution, Amazon fulfillment, port access, agriculture | `charlotte-nc`, `philadelphia-pa` |
| Des Moines, IA | `des-moines-ia` | ~1,100mi | I-80, I-35, I-235 | Agriculture, food processing, distribution, insurance logistics | `kansas-city-mo`, `chicago-il` |
| Portland, OR | `portland-or` | ~2,100mi | I-5, I-84, I-205 | Timber, tech manufacturing, agriculture, port logistics | `los-angeles-ca` |

Each `metaDescription` will follow the Columbus pattern:
> "Trailer rental in {City}, {ST}. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564."

Each `testimonialSnippet` will reinforce the Texas pricing angle.

### 2. Update `getLocationsByRegion()` filters

- Add `"PA"` → new `northeast` region
- Add `"FL"`, `"VA"` → `southeast`
- Add `"IA"` → `midwest`
- Add `"OR"` → `west` (rename from `southwest`, or add new group)

### 3. Update existing `nearbyCities` cross-links

- `charlotte-nc` → add `"richmond-va"`, `"jacksonville-fl"`
- `atlanta-ga` → add `"jacksonville-fl"`
- `columbus-oh` → add `"philadelphia-pa"`
- `kansas-city-mo` → add `"des-moines-ia"`
- `los-angeles-ca` → add `"portland-or"`

### 4. `public/sitemap.xml`

Add 5 new `<url>` entries for each `/locations/{slug}`.

### 5. `src/pages/Locations.tsx`

Add rendering for new regions (`northeast`, `west`) if they don't already exist in the hub page layout.

## Files to Change
- `src/lib/locations.ts` — add 5 entries, update region filters, update cross-links
- `public/sitemap.xml` — add 5 URLs
- `src/pages/Locations.tsx` — add new region sections if needed

