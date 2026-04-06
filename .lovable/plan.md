

## Add Title Document & DOT Inspection Photos to Customer Trailers View

### Overview
Mechanics need to upload a vehicle title document photo per trailer. Customers need to see both the title document and their latest DOT inspection photos on their "My Rentals" page.

### Changes

**1. Database migration — add `title_document_url` to `trailers` table**

```sql
ALTER TABLE public.trailers ADD COLUMN title_document_url text;
```

No new RLS needed — existing trailer policies already cover admin writes and customer reads.

**2. Admin TrailerDetail page — add title document upload**

File: `src/pages/admin/TrailerDetail.tsx`

- Add a "Title Document" photo upload section using the existing `trailer-photos` storage bucket
- Upload to path `{trailerId}/title/{timestamp}.jpg` in `trailer-photos` bucket
- Save the public URL to `trailers.title_document_url`
- Show existing title photo with replace/delete option

**3. Mechanic access — allow mechanics to upload title document**

File: `src/pages/mechanic/MechanicDashboard.tsx`

- When a mechanic views a trailer, add a "Upload Title Document" button
- Uses same storage bucket and saves to `trailers.title_document_url`

Database migration — allow mechanics to update `title_document_url`:
```sql
CREATE POLICY "Mechanics can update trailer title document"
ON public.trailers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'mechanic'::app_role))
WITH CHECK (has_role(auth.uid(), 'mechanic'::app_role));
```

**4. Customer Rentals page — show title + DOT inspection photos**

File: `src/pages/customer/Rentals.tsx`

- Fetch `title_document_url` in the trailer select query (already selecting from trailers)
- For each trailer, fetch the latest completed DOT inspection and its photos from `dot_inspections` + `dot_inspection_photos`
- Add a "Documents" section to each trailer card:
  - **Title Document**: Thumbnail with click-to-expand (if `title_document_url` exists)
  - **DOT Inspection**: Photo gallery from the most recent completed inspection, with inspection date
- Use a Dialog/modal for full-size photo viewing

### Files Modified
| File | Change |
|------|--------|
| New migration | Add `title_document_url` column + mechanic update policy |
| `src/pages/admin/TrailerDetail.tsx` | Title document upload UI |
| `src/pages/mechanic/MechanicDashboard.tsx` | Title document upload for mechanics |
| `src/pages/customer/Rentals.tsx` | Display title doc + DOT inspection photos per trailer |

