

# Add 3 Missing Location Pages: New York, Oklahoma City, Seattle

## Context
Your GA data shows 15 top out-of-state markets. We already have pages for 12 of them. Three states with real traffic have no location page yet:

| State | Users | City to Target | Why |
|-------|-------|---------------|-----|
| New York | 12 | New York City | Largest US metro, high freight volume |
| Oklahoma | 7 | Oklahoma City | Adjacent to TX, I-35 corridor |
| Washington | 7 | Seattle | Pacific NW logistics hub, pairs with Portland |

All three will use `isPickupFriendly: false` to trigger the existing "Texas prices + nationwide delivery" template messaging.

## Changes

### 1. `src/lib/locations.ts`
Add 3 new location entries:

- **New York City, NY** — slug `new-york-ny`, ~1,800mi, I-95/I-78/I-87, port logistics, e-commerce fulfillment, retail distribution. Nearby: `philadelphia-pa`.
- **Oklahoma City, OK** — slug `oklahoma-city-ok`, ~450mi, I-35/I-40/I-44, oil & gas, agriculture, distribution. Nearby: `dallas-tx`, `kansas-city-mo`.
- **Seattle, WA** — slug `seattle-wa`, ~2,200mi, I-5/I-90/I-405, port logistics, tech, timber, agriculture. Nearby: `portland-or`, `los-angeles-ca`.

Each `metaDescription` leads with Texas pricing + nationwide delivery.

### 2. Update `getLocationsByRegion()`
- Add `"NY"` to `northeast` filter
- Add `"OK"` to `southwest` filter
- Add `"WA"` to `west` filter

### 3. Update existing `nearbyCities` cross-links
- `philadelphia-pa` → add `"new-york-ny"`
- `dallas-tx` → add `"oklahoma-city-ok"`
- `kansas-city-mo` → add `"oklahoma-city-ok"`
- `portland-or` → add `"seattle-wa"`
- `los-angeles-ca` → add `"seattle-wa"`

### 4. `public/sitemap.xml`
Add 3 new URL entries.

### Files
- `src/lib/locations.ts`
- `public/sitemap.xml`

