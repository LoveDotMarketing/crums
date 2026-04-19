

## Plan: Let Salesmen See Trailer Photos

### Root cause

Photos are uploaded to the public `trailer-photos` storage bucket (anyone with the URL can view), but metadata rows live in the `trailer_photos` table which has **only one RLS policy**:

```
"Admins can manage trailer photos" — has_role(auth.uid(), 'admin')
```

So when a salesman opens `/dashboard/admin/fleet/<id>`, the `SELECT` from `trailer_photos` returns zero rows → no thumbnails render. Same for the title document (read straight from `trailers`, which the salesman can already read).

The salesman role already has `fleet` permission and can navigate to TrailerDetail — the only gap is the photo metadata read.

### Fix (single migration, no code changes needed)

Add a non-destructive RLS policy on `public.trailer_photos`:

```sql
CREATE POLICY "Staff can view trailer photos"
ON public.trailer_photos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'sales')
  OR has_role(auth.uid(), 'mechanic')
);
```

This adds **read-only** access for sales and mechanic roles. The existing admin-only `ALL` policy stays untouched, so only admins can upload/edit/delete (matches Ambrosia's intent: salesmen *view* what admins have already uploaded).

### Verification after deploy

- Sales role logs in → opens Fleet → clicks any trailer → "Photos" section renders thumbnails.
- Sales role still cannot upload, edit captions, or delete photos (the upload UI in `TrailerDetail.tsx` will silently fail RLS on insert, which is fine — but for cleanliness I'll also conditionally hide the upload dropzone for non-admins).

### Files

1. **New migration** — add `Staff can view trailer photos` SELECT policy on `public.trailer_photos`.
2. **`src/pages/admin/TrailerDetail.tsx`** — gate the photo *upload* dropzone, *delete* X buttons, and caption-edit affordance behind `userRole === 'admin'` so salesmen see a clean view-only gallery (no broken upload buttons).

That's it. No bucket changes, no schema changes, no edge function changes.

