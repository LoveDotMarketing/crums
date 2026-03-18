

## Allow Mechanics to Edit Submitted Work Orders & Add Photos

Based on the screenshot message, there are two requests:
1. Mechanics should be able to go back and edit work orders after submission (currently locked once submitted)
2. Mechanics should be able to add photos to work orders (no photo system exists for work orders yet)

### Current State
- Work orders can only be edited in `in_progress` (Draft) or `needs_info` status
- Once submitted/approved/rejected, the mechanic cannot make changes
- There is no photo upload capability on work orders (only on DOT inspections)

### Changes

#### 1. Allow editing submitted work orders
- Expand `EDITABLE_STATUSES` in `src/pages/mechanic/WorkOrders.tsx` to include `"submitted"` — mechanics can reopen and edit work orders they've submitted but that haven't been approved yet
- Keep `approved` and `rejected` locked to maintain audit integrity
- When a mechanic edits a submitted work order, reset status back to `in_progress` (draft) so they can re-submit

#### 2. Add work order photo uploads
- **New database table**: `work_order_photos` with columns: `id`, `work_order_id` (FK), `photo_url`, `category` (e.g. "before", "after", "parts"), `uploaded_by`, `created_at`
- **RLS**: Mechanics can manage photos on their own work orders; admins can manage all
- **New component**: `WorkOrderPhotoUpload` — reuses the compression logic from `InspectionPhotoUpload`, uploads to a `work-order-photos` storage bucket
- **Storage bucket**: Create `work-order-photos` bucket (public read for signed URLs)
- **Integration into WorkOrderForm**: Add a "Photos" card section at the bottom of the form where mechanics can upload before/after/parts photos
- **View-only photo display**: On non-editable work orders (approved/rejected), clicking a card shows a read-only detail dialog with photos visible but not editable
- **Always allow photo additions**: Even on submitted work orders, photos can be added without changing status — this lets mechanics add photos later without reopening the order

#### 3. Read-only detail view for locked work orders
- Currently clicking a non-editable work order just shows a toast "Only draft or needs-info work orders can be edited"
- Change this to open a read-only Dialog showing all work order details + photos, so admins and mechanics can review completed work

### Files Changed
- `src/pages/mechanic/WorkOrders.tsx` — expand editable statuses to include `submitted`, add read-only detail dialog for locked orders
- `src/components/mechanic/WorkOrderForm.tsx` — add Photos card section with upload capability
- `src/components/mechanic/WorkOrderPhotoUpload.tsx` — new component (adapted from InspectionPhotoUpload)
- **Database migration** — create `work_order_photos` table with RLS, create `work-order-photos` storage bucket

### What stays the same
- Approved/rejected work orders remain locked (no edits)
- Admin work order review page unchanged
- Line item delete-and-reinsert strategy unchanged
- Labor rate ($85/hr) and travel fee ($75) unchanged

