

## Bulk-Update 20 Dry Van Trailers with Manufacturer Spec Sheet Data

### Summary

The spec sheet (Great Dane Order #176075, Model CCC-3314-21053) confirms the profile page specs are **correct** — no inaccuracies on the landing page. However, the database records for all 20 trailers have empty specification fields. This plan bulk-updates those fields and adds a few extra details from the spec sheet to the profile page.

### What the spec sheet confirms

| Spec | Value from Spec Sheet | Profile Page | Match? |
|------|----------------------|--------------|--------|
| Model | CCC Champion Composite Plate | Great Dane Champion | Yes |
| Length | 53' 0" | 53' | Yes |
| Height | 13' 6" | 13'6" | Yes |
| Suspension | Hendrickson ULTRAAK 40K | Hendrickson ULTRAAK 40K | Yes |
| Floor | Hardwood Lam. 1.38" | 1.38" Hardwood Laminated | Yes |
| Doors | 0.50" Composite Swing Door | Composite Swing Doors | Yes |
| Side Skirts | Energy Guard 19' x 32" | Energy Guard | Yes |
| Telematics | FleetPulseGo Track | FleetPulseGo | Yes |
| ABS | Wabco 2S/1M iABS | Anti-lock braking system | Yes |
| LED Lights | All Lights LED, Grote | LED exterior lighting | Yes |
| Roof | Aluminum | Aluminum roof | Yes |

### Changes

**1. Database — Bulk update all 20 trailers' spec fields**

Update all trailers where `year = 2027 AND type = 'Dry Van'`:
- `model` → `CCC-3314-21053`
- `body_material` → `Composite Plate`
- `door_type` → `Composite Swing`
- `floor_thickness` → `1.38" Hardwood Laminated`
- `roof_type` → `Aluminum`
- `side_skirt_type` → `Energy Guard`
- `suspension_type` → `air_ride`
- `tire_type` → `295/75R 22.5 Bridgestone Ecopia`
- `inside_width` → `102.36"`
- `side_post_spacing` → `50" Centers`
- `crossmember_spacing` → `12" Centers`

**2. Profile page — Add a few extra verified specs**

File: `src/pages/TrailerProfile2027GreatDane.tsx`
- Update Model value from "Great Dane Champion" → "Great Dane Champion CCC-3314-21053"
- Add spec rows: Width (102.36"), Axles (Tandem, Slide Air-Ride), Tires (295/75R 22.5 Bridgestone Ecopia), Brakes (16.50" x 7.00" with Wabco ABS)
- Add features: Hendrickson TIREMAAX CP tire inflation system, Jost A451 Magnum landing gear, EnduroGuard swing door frame, Wabco 2S/1M iABS, 295/75R 22.5 Bridgestone Ecopia tires

### Files changed
- Database — bulk update 20 trailer records
- `src/pages/TrailerProfile2027GreatDane.tsx` — enhanced specs and features from manufacturer data

