

## Add Trailer Photo Upload to Admin Trailer Detail

### What Changes
Add a "Photos" section to the admin trailer detail page where you can manually upload, view, and delete photos for each trailer. This requires a new database table and storage bucket, plus a new UI section on the page.

### Database Changes
- **New table `trailer_photos`**: `id` (uuid PK), `trailer_id` (uuid FK → trailers), `photo_url` (text), `caption` (text, nullable), `display_order` (integer, default 0), `uploaded_by` (uuid), `created_at` (timestamptz)
- **RLS**: Admin ALL policy (only admins manage trailer photos)
- **Storage bucket**: `trailer-photos` (public, like `work-order-photos`)

### UI Changes — `src/pages/admin/TrailerDetail.tsx`
- Add a new "Photos" Card section between the main detail grid and Maintenance History
- Grid display of uploaded photos with captions
- Upload button using file input with the same image compression logic from `WorkOrderPhotoUpload`
- Optional caption input per photo
- Delete button (with confirmation) on each photo
- Drag-to-reorder could be added later; for now, photos display in upload order

### Files Changed
- **Database migration** — create `trailer_photos` table + RLS + storage bucket
- **`src/pages/admin/TrailerDetail.tsx`** — add Photos card section with upload/view/delete functionality (self-contained, no separate component needed since it's admin-only)

