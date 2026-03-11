

# Add Columbus, Ohio Location Page

## Context
You have 47 users from Ohio (your organic caller's state) with no Ohio-specific landing page. The caller validated the value prop: **cheaper Texas prices + nationwide delivery**. This is the exact messaging to optimize for.

## What to Build

### 1. Add Columbus, OH to `src/lib/locations.ts`

New location entry with:
- **slug**: `columbus-oh`
- **h1**: "Trailer Rental & Leasing in Columbus, Ohio"
- **metaTitle**: "Trailer Rental Columbus OH | Texas Prices, Delivered | CRUMS Leasing"
- **metaDescription**: Emphasize competitive Texas pricing + delivery to Ohio — the exact angle that converted your caller
- **distanceFromBulverde**: ~1,250 miles, `isPickupFriendly: false`
- **keyHighways**: I-70, I-71, I-270, I-670
- **keyIndustries**: Logistics/distribution, automotive (Honda Marysville), e-commerce (Amazon fulfillment), agriculture, steel
- **nearbyAirports**: CMH - John Glenn Columbus International
- **regionalContext**: Columbus is Ohio's capital and fastest-growing city, sitting at the I-70/I-71 crossroads. Major logistics hub with massive Amazon and distribution center presence. 60% of the US population reachable within a day's drive.
- **landmarks**: Serving carriers near Rickenbacker Intermodal Yard, Groveport logistics corridor, Honda Marysville plant, and the I-270 outer belt distribution centers
- **nearbyCities**: `["indianapolis-in", "charlotte-nc"]` (existing pages)
- **testimonialSnippet**: Based on the real caller insight — something like "Texas prices beat what I was paying up here. And they delivered it right to my yard." — Ohio carrier

### 2. Update `getLocationsByRegion()` in `src/lib/locations.ts`

Add `"OH"` to the `midwest` filter so Columbus shows up in the Locations hub page under the Midwest region.

### 3. Update nearby city cross-links

Add `"columbus-oh"` to the `nearbyCities` array for `indianapolis-in` so they cross-link to each other.

### 4. Sitemap

Add Columbus to `public/sitemap.xml` with the new `/locations/columbus-oh` URL.

## No other changes needed
The routing (`/locations/:citySlug` → `CityLocationPage` → `LocationPageTemplate`) already handles new entries automatically. The template already has delivery-focused messaging for non-pickup locations, FAQ schema, LocalBusiness structured data, and the "Top Choice" SEO sections.

## Files to Change
- `src/lib/locations.ts` — add Columbus entry + update midwest filter + cross-link Indianapolis
- `public/sitemap.xml` — add new URL entry

