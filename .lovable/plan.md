

## Auto-Update Past-Due Scheduled Content to "Published"

### Problem
Content items with a `scheduled_date` in the past still show "Scheduled" status. They should automatically transition to "Published" since the release date has passed.

### Solution
Add logic to the Content Schedule page that automatically marks past-due "scheduled" items as "published" when the page loads. This is a simple client-side check on each data fetch.

### Implementation

**File: `src/pages/admin/ContentSchedule.tsx`**

1. Add a `useEffect` that runs after `scheduledContent` is fetched.
2. It filters for items where `status === "scheduled"` and `scheduled_date < today`.
3. For each past-due item, it updates the status to `"published"` and sets `published_at` to the scheduled date (9:00 AM CST).
4. After updates, it invalidates the query to refresh the table.

### Technical Details

- The check compares `scheduled_date` against today's date (`new Date()` formatted as `yyyy-MM-dd`).
- The update sets `status = 'published'` and `published_at = scheduled_date + 'T15:00:00Z'` (9:00 AM CST = 15:00 UTC).
- Currently only 1 record is affected (Feb 4 guide), but this will automatically handle future items as their dates pass.
- The auto-update runs silently without toast notifications to avoid noise on every page load.

