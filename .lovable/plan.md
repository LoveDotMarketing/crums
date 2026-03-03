

## Show Decoded Fields on Fleet Table

The bulk decode updated trailers with make, model, axle count, and body material data. The admin TrailerDetail page already displays all these fields. However, the Fleet table currently only shows: VIN, Type, Year, Monthly Price, Lessee, Status, Purchase Price, Maintenance, Income, ROI.

### Changes to `src/pages/admin/Fleet.tsx`

Add **Make** and **Body Material** columns to the Fleet table between the existing Year and Monthly Price columns:

- Add `<SortableHeader column="make">Make</SortableHeader>` and `<TableHead>Material</TableHead>` to the table header
- Add corresponding `<TableCell>` entries showing `trailer.make || "-"` and `trailer.body_material || "-"`

This keeps the table informative without being too wide (axle count is a minor detail best left on the detail page).

