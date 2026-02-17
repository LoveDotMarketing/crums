

## Link Work Orders to Trailer Maintenance History

### The Problem
When a mechanic's work order is approved, nothing happens to the trailer's financial records. The `maintenance_records` table and `trailers.total_maintenance_cost` field exist but are never updated from approved work orders. This means you can't track per-trailer repair costs or calculate ROI.

### The Fix

**1. Database trigger: auto-create maintenance record on work order approval**

When a work order's status changes to "approved", a database trigger will automatically:
- Insert a row into `maintenance_records` with the trailer_id, cost (grand_total), description, mechanic_id, date, and mark it completed
- Store the `work_order_id` on the maintenance record so they're linked
- Add the work order's `grand_total` to the trailer's `total_maintenance_cost`

This means the Financial Summary on the Trailer Detail page (Purchase Price, Total Maintenance, Rental Income, Net Return) will automatically reflect approved work order costs.

**2. Add `work_order_id` column to `maintenance_records`**

A new nullable column linking maintenance records back to the work order that created them, so you can trace costs back to the original invoice.

**3. Show work order details in the trailer's Maintenance History**

Update the Maintenance History table on the Trailer Detail page to show the repair type and link back to the work order when one exists, so you get full visibility into what was done and what it cost.

### What Changes

| File | Change |
|------|--------|
| New migration SQL | Add `work_order_id` to `maintenance_records`, create trigger that fires when work order status becomes "approved" to insert maintenance record and update trailer cost |
| `src/pages/admin/TrailerDetail.tsx` | Update Maintenance History table to show repair type and source (work order vs manual entry) |

### How It Works

1. Mechanic submits a work order for trailer #56171 -- $875 total (brakes + tires)
2. Admin reviews and clicks "Approve"
3. Trigger fires automatically:
   - Creates a maintenance record: "Brakes / Tire Repair -- $875, completed"
   - Updates trailer #56171: `total_maintenance_cost += $875`
4. Admin opens Trailer Detail page and sees:
   - Financial Summary shows updated maintenance costs and net return
   - Maintenance History shows the new record linked to the work order
