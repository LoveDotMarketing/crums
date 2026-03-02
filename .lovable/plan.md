
## Plan: Allow managing trailers on pending subscriptions

### Problem
Ground Link LLC has a subscription with status **"pending"**. The "Manage Trailers" menu option in the Billing page only appears for subscriptions with `status === "active"` (line 1545 of `Billing.tsx`). This prevents adding more trailers.

### Solution
Extend the condition that shows the "Manage Trailers" dropdown item to also include `"pending"` status subscriptions.

### Change

**`src/pages/admin/Billing.tsx` (~line 1545)**
- Change `{sub.status === "active" && (` to `{(sub.status === "active" || sub.status === "pending") && (` for the "Manage Trailers" menu item specifically
- Keep the other active-only actions (Charge Customer, etc.) gated to `"active"` only
