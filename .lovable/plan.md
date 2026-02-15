

## Fix Mechanic DOT Inspection Access and Photo Uploads

Two issues reported by the mechanics team:

### Issue 1: "Not all trailers have the option to fill out DOT"

Currently the "DOT Inspection" button **only shows for trailers with status "available"**. Out of 49 trailers, only 3 are available -- the other 46 (12 maintenance, 8 pending, 26 rented) have no DOT inspection option.

**Fix:** Show the DOT Inspection button for trailers in `available`, `maintenance`, and `pending` statuses. Mechanics need to be able to run DOT inspections on trailers in maintenance (that's often why they're in maintenance) and pending trailers that need certification before release.

### Issue 2: "Photos won't upload when we take them"

The storage bucket and database table both have RLS policies that require the `mechanic` role via the `has_role()` function, which checks the `user_roles` table. Currently only **one user** (`prroadside@gmail.com`) has the mechanic role. Any other mechanics logging in would have their photo uploads silently rejected by RLS.

**Fix:** Two changes:
- Add better error surfacing in the photo upload component so mechanics see the actual error instead of a generic "Failed to upload photo" message
- Ensure the `dot_inspection_photos` INSERT policy also accepts users who created the inspection (matching `inspector_id`), not just role-based checks -- this is already the case for the table, but the **storage bucket** policy only checks role, so if a mechanic's role is missing, the file never makes it to storage

We'll also add a storage UPDATE policy (currently missing), since some upload flows may need it.

### Files to Change

**`src/pages/mechanic/MechanicDashboard.tsx`**
- Expand the DOT Inspection button visibility from `status === "available"` to also include `maintenance` and `pending` statuses
- Keep existing conditions (not rented) intact

**`src/components/mechanic/InspectionPhotoUpload.tsx`**
- Improve error messaging to show the actual error from storage/database so mechanics can report specific issues
- Add a retry mechanism for failed uploads

**Database Migration**
- Add a storage UPDATE policy for the `dot-inspection-photos` bucket (currently missing -- could cause issues with certain upload flows)
- Broaden the storage INSERT policy to also allow users who own the inspection (via a subquery on `dot_inspections.inspector_id`), so even if the `user_roles` entry is missing, the photo upload still works for the active inspector

### Technical Details

**MechanicDashboard.tsx line ~1015 change:**
```text
BEFORE: trailer.status === "available" && !trailer.is_rented
AFTER:  ["available", "maintenance", "pending"].includes(trailer.status) && !trailer.is_rented
```

**Storage policy addition (SQL migration):**
```sql
-- Add UPDATE policy (missing)
CREATE POLICY "Mechanics can update their inspection photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'dot-inspection-photos' AND has_role(auth.uid(), 'mechanic'::app_role));

-- Broaden INSERT to also check inspector ownership
DROP POLICY "Mechanics can upload inspection photos" ON storage.objects;
CREATE POLICY "Mechanics can upload inspection photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dot-inspection-photos'
  AND (
    has_role(auth.uid(), 'mechanic'::app_role)
    OR EXISTS (
      SELECT 1 FROM dot_inspections
      WHERE inspector_id = auth.uid()
      AND status = 'in_progress'
    )
  )
);
```

**InspectionPhotoUpload.tsx improvements:**
- Show specific error messages from the storage/database response
- Log the error details for debugging
