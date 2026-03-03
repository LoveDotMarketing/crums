

## VIN Decoder for Admin Fleet Page

Add a "Decode VIN" button next to the VIN input field in both the Add Trailer dialog (Fleet.tsx) and the Edit Trailer form (TrailerDetail.tsx). When clicked, it calls the free NHTSA vPIC API to auto-fill make, model, year, and type.

### Implementation

**1. Create a shared VIN decoder utility** (`src/lib/vinDecoder.ts`)
- Function `decodeVin(vin: string)` that calls `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{vin}?format=json`
- Parses relevant fields: Make, Model, ModelYear, BodyClass
- Maps BodyClass to trailer types (e.g., "Van" → "Dry Van")
- Returns `{ make, model, year, type }` or throws on invalid VIN

**2. Update Add Trailer dialog in `src/pages/admin/Fleet.tsx`** (lines 539-546)
- Add a "Decode" button next to the VIN input
- On click, call `decodeVin`, then auto-fill `make`, `model`, `year`, and `type` fields in `newTrailer` state
- Show loading spinner during fetch, toast on error

**3. Update Edit Trailer form in `src/pages/admin/TrailerDetail.tsx`** (lines 502-511)
- Add a "Decode" button next to the VIN input (only visible in edit mode)
- On click, call `decodeVin`, then auto-fill `make`, `model`, `year`, and `type` in `formData` state
- Same loading/error handling

### Notes
- NHTSA API is free and requires no API key
- Called client-side directly (public API, no CORS issues)
- Only auto-fills fields that return valid data; does not overwrite if NHTSA returns empty

