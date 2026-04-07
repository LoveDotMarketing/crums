

## Allow Admins to Assign "Pending" Trailers to Subscriptions

### Problem
When a customer calls to reserve a trailer, admins set the trailer status to "pending." However, the subscription creation and trailer management dialogs only show trailers with status `"available"`, so admins cannot assign a pending trailer. They have to manually change it back to available first.

### Solution
Update three filter locations to include `"pending"` alongside `"available"` when listing assignable trailers. The existing `create-subscription` edge function already sets the trailer to `"rented"` upon assignment (line 663), so no backend changes are needed — the status will automatically transition from pending to rented.

### Changes

**1. `src/components/admin/CreateSubscriptionDialog.tsx`**
- Line 192: Change `.eq("status", "available")` to `.in("status", ["available", "pending"])`
- Line 219: Same change for the second query

**2. `src/components/admin/ManageTrailersDialog.tsx`**
- Line 90: Change `.in("status", ["available"])` to `.in("status", ["available", "pending"])`

No database migration or edge function changes required. The create-subscription function already sets `status: "rented"` when assigning a trailer.

