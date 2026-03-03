

## Add Axle Count and Body Material to Trailers

Add two new columns to the `trailers` table (`axle_count` and `body_material`), update the VIN decoder to extract these fields from NHTSA, and display/edit them on both the Fleet and TrailerDetail pages.

### 1. Database Migration
Add two columns to `public.trailers`:
```sql
ALTER TABLE public.trailers ADD COLUMN axle_count integer;
ALTER TABLE public.trailers ADD COLUMN body_material text;
```
Then update trailer #034038 with the known values:
```sql
UPDATE public.trailers SET axle_count = 2, body_material = 'Aluminum/Steel' WHERE id = '66fc68b1-7f42-4a87-af0e-03909b813c29';
```

### 2. Update VIN Decoder (`src/lib/vinDecoder.ts`)
- Add `axle_count` and `body_material` to `VinDecodedResult`
- Parse `Axles` (as integer) and combine `BodyClass` material info or use NHTSA fields like `OtherBodyInfo` for material
- Return these in the decoded result

### 3. Update TrailerDetail page (`src/pages/admin/TrailerDetail.tsx`)
- Add `axle_count` and `body_material` to the `Trailer` interface and `formData`
- Add display/edit fields in the specifications section
- Auto-fill from VIN decode

### 4. Update Fleet page (`src/pages/admin/Fleet.tsx`)
- Add `axle_count` and `body_material` to the `Trailer` interface and `newTrailer` state
- Add input fields in the Add Trailer dialog
- Auto-fill from VIN decode

