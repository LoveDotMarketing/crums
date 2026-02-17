

## Mechanic Service Catalog and Maintenance Invoicing

### What We're Building

The mechanic's Work Order form currently requires manually typing part names and costs. We'll replace this with a **pre-built service catalog** based on the uploaded CRUMS Leasing Breakdown List, so the mechanic can select services/parts from a dropdown and the prices auto-fill. The compiled invoice then goes to the admin Work Orders page for review, approval, and payment.

### Changes

**1. Add a Service Catalog table to the database**

A new `service_catalog` table stores all items from the PDF. Each row has:
- `name` (e.g., "RECAP TIRE")
- `category` (Tires, Brakes, Electrical, General, etc.)
- `parts_price` (nullable, e.g., 275.00)
- `labor_price` (nullable, for flat-rate services like DOT Inspection at $67)
- `labor_hours` (nullable, e.g., 0.5)
- `is_active` (default true)

Pre-seed all ~50 items from the PDF into this table. RLS: admins can manage, mechanics can read.

**2. Update the Mechanic Work Order Form**

Replace the current free-text "Add Part" flow with a **"Add Service/Part" picker** that:
- Shows a searchable dropdown grouped by category (Tires, Brakes, Electrical, etc.)
- When selected, auto-fills the description, unit cost, and labor hours
- Mechanic can still override quantities and adjust costs if needed (e.g., "RIM AND TIRE" says "$350 depending on brand")
- A "Custom Item" option remains for anything not on the list
- Labor hours from selected services auto-accumulate into the total labor calculation

The categories from the PDF:
- **General**: Hourly Rate, Service Fee, DOT Inspection, Alignment
- **Tires and Wheels**: Recap Tire, Rim and Tire, Rim, Tire Repair, Tire Lube, Valve Stem, Airline Hose, Lug Nut, TPMS Hose, Spindle Plugs, Tru-Tees, Mounting/Dismount
- **Maintenance Supplies**: Brake Cleaner, Rags, Gear Oil, Grease Tube, Hub Oil
- **Mud Flaps**: Mud Flap, Mudflap Bracket, Mudflap Bracket Spring Loaded, Straightening Bracket
- **Hub and Bearings**: Hubcap, Hubcap and Gasket, Inner/Outer Bearing, Wheel Seal
- **Brakes**: Brakes, Adjusting Brakes, Brake Drums, SR-5 Valve, Cotter Pins Kit, S-Cam Bushing Kit/Brackets, Slack Adjuster, Brake Chamber (Welded/Cut Rod), Clevis/Pins, Brake Chamber Hose, Airbag (all sizes), Airbag Valve
- **Electrical and Lights**: Red/Blue Gladhand, 7-Way Plug/Box, Clearance Light, Marker Light, Penny Light, ABS Light, ABS Sensors
- **Body and Structure**: Panel Patches, Bolts and Nuts

**3. No admin page changes needed**

The existing admin Work Orders page already handles review, approve, reject, and request-info workflows. The line items table already displays parts with quantities and costs. No changes needed there -- it will automatically show the catalog items the mechanic selected.

### Technical Details

| File | Change |
|------|--------|
| New migration SQL | Create `service_catalog` table, seed ~50 rows from PDF, add RLS policies |
| `src/components/mechanic/WorkOrderForm.tsx` | Replace free-text parts entry with catalog picker (searchable Select grouped by category), auto-fill prices/hours, keep custom item option |

### How It Works (Mechanic Flow)

1. Mechanic selects a trailer and repair type (unchanged)
2. Mechanic clicks "Add Service/Part" -- sees grouped catalog
3. Selects e.g. "BRAKES" from the Brakes category -- price ($125) and labor (1.5 hrs) auto-fill
4. Can adjust quantity, override price if needed
5. Adds more items, labor hours auto-sum
6. Submits for review -- goes to admin Work Orders as today

