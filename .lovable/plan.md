

## Add Extended Trailer Spec Fields

### What the VIN/NHTSA API can provide
The NHTSA vPIC API returns limited trailer data. Of the 12 requested specs, **only suspension type has a slim chance** via the `SpringType` field, but it's unreliable for trailers. Everything else requires manual entry by the fleet manager.

**VIN-decodable (already captured):** Make, Model, Year, Type, Axle Count, Body Material
**NOT VIN-decodable (all new fields below):** Door Type, Suspension, Empty Weight, Last PM Date, Inside Width, Side Post Spacing, Crossmember Spacing, Side Skirts, Tire Type/Tread, Floor Thickness, Roof Type

Pictures before/after pickup are already handled by the mechanic portal's inspection photo system.

### 1. Database Migration — Add columns to `trailers` table

```sql
ALTER TABLE public.trailers
  ADD COLUMN door_type text,              -- 'swing' or 'roll'
  ADD COLUMN suspension_type text,        -- 'air_ride' or 'spring'
  ADD COLUMN empty_weight integer,        -- lbs
  ADD COLUMN last_pm_date date,           -- most recent preventive maintenance
  ADD COLUMN inside_width text,           -- e.g. "101.5 in"
  ADD COLUMN side_post_spacing text,      -- e.g. "12 in", "24 in", "E-Track 2 rows"
  ADD COLUMN crossmember_spacing text,    -- e.g. "12 in"
  ADD COLUMN has_side_skirts boolean DEFAULT false,
  ADD COLUMN side_skirt_type text,        -- e.g. "Full length", "Partial"
  ADD COLUMN tire_type text,             -- e.g. "Goodyear G316"
  ADD COLUMN tire_tread_condition text,  -- e.g. "New", "Good", "Fair"
  ADD COLUMN floor_thickness text,       -- e.g. "1-1/8 in hardwood"
  ADD COLUMN roof_type text;             -- e.g. "Aluminum", "Translucent"
```

### 2. Update `TrailerDetail.tsx` — Add new fields to the edit form

Add a new "Specifications" card below the existing Trailer Details card with all 13 new fields, organized in a grid. Each field follows the existing read/edit pattern (display text in view mode, Input/Select in edit mode).

Group the fields logically:
- **Structure**: Door Type (select: Swing/Roll), Suspension (select: Air Ride/Spring), Roof Type, Floor Thickness, Inside Width
- **Load Securement**: Side Post Spacing, Crossmember Spacing
- **Exterior**: Side Skirts (checkbox + type text), Empty Weight
- **Tires**: Tire Type, Tread Condition
- **Maintenance**: Last PM Date (date input)

### 3. Update `handleSave` — Include new fields in the update payload

Add all 13 new columns to the `.update()` call in `handleSave`.

### 4. Update the `Trailer` interface — Add new field types

Add all new fields to the local `Trailer` interface in `TrailerDetail.tsx`.

### 5. Update VIN decoder — Try to extract suspension from NHTSA

Enhance `vinDecoder.ts` to check the `SpringType` field from NHTSA and map it to `suspension_type` (`air_ride` or `spring`). This is best-effort; most trailer VINs won't return it.

### Summary
- **11 new columns** on the `trailers` table (all nullable, no data loss)
- **1 new Specifications card** on the trailer detail page
- **VIN decoder enhancement** for suspension (best-effort)
- No RLS changes needed (existing admin policies cover new columns)
- Pictures before/after are already handled by the existing inspection system

