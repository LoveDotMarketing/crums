

## Bulk VIN Decode for Fleet

Add a "Bulk Decode VINs" button to the Fleet page that iterates through all trailers with a VIN but missing make/model/year/axle_count/body_material data, decodes each via NHTSA, and updates the database records.

### Implementation

**1. Add bulk decode function to `src/pages/admin/Fleet.tsx`**
- New state: `bulkDecoding` (boolean), `bulkProgress` (object with `current`, `total`, `updated`, `skipped`, `failed` counts)
- Function `handleBulkDecode`:
  - Filters trailers that have a VIN and are missing any of: make, model, year, type, axle_count, body_material
  - Loops through each, calls `decodeVin(vin)`, builds an update object with only the fields that are currently null/empty and have valid decoded values
  - Updates each trailer record via Supabase
  - Shows a progress toast during processing and a summary toast on completion
- Add a "Bulk Decode VINs" button near the existing "Add Trailer" button in the toolbar area
- Show a progress indicator (e.g. "Decoding 3/12...") while running

**2. UI placement**
- Button with a `Loader2` spinner icon while active, disabled during processing
- Only visible when there are trailers with VINs that have missing data

### Technical notes
- Uses the existing `decodeVin` utility from `src/lib/vinDecoder.ts`
- Sequential API calls (not parallel) to avoid rate-limiting the free NHTSA API
- Only overwrites null/empty fields — never replaces existing data
- Refreshes fleet data after completion

