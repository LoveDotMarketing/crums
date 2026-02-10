

## Sync Guides Page with Content Schedule

### Problem
The /resources/guides page uses a static `available` flag in `src/lib/guides.ts` to show "Coming Soon" vs "Read Guide". But the content scheduler in the admin backend tracks actual publication dates. These are disconnected, so guides stay "Coming Soon" even after their scheduled date passes.

### Solution
Make the Guides page query the `scheduled_content` table to dynamically determine guide availability. If a guide has been published (status = "published" or scheduled date has passed), it shows as available. If it has a future scheduled date, show the date instead of "Coming Soon".

### Changes

**1. `src/pages/resources/Guides.tsx`**
- Add a query to fetch `scheduled_content` records for guides.
- Cross-reference each guide's slug with the scheduled content data.
- If `status === 'published'` or `scheduled_date <= today`, treat the guide as available (show "Read Guide" button).
- If `status === 'scheduled'` and `scheduled_date > today`, show "Scheduled: [date]" instead of "Coming Soon".
- Fall back to the static `available` flag if no scheduled_content record exists.

**2. `src/lib/guides.ts`**
- Set `available: true` for all guides that have fully built page components and have been published per the schedule. Specifically, flip `road-comfort` to `available: true` since its Feb 4 date has passed and the page exists.

**3. `src/pages/admin/ContentSchedule.tsx`**
- Enhance the auto-publish logic: when marking a guide as "published", also note that the front-end will now pick this up dynamically.

### What the user will see
- Guides with past scheduled dates: "Read Guide" button (clickable)
- Guides with future scheduled dates: "Scheduled: Feb 18" (with date shown)
- Guides with no schedule and not available: "Coming Soon" (unchanged)

