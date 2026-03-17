

## Add "Month to Month" Subscription Type + Inline Trailer Editing

Two changes requested for the Edit Subscription panel:

### 1. Add "Month to Month" subscription type

The `subscription_type` enum in Postgres needs a new value. Then update the UI list.

**Database migration:**
```sql
ALTER TYPE public.subscription_type ADD VALUE 'month_to_month';
```

**UI change** in `EditSubscriptionPanel.tsx` — add to the `subscriptionTypes` array:
```ts
{ value: "month_to_month", label: "Month to Month", icon: <CalendarIcon /> }
```

Also update `CreateSubscriptionDialog.tsx` and any other places that list subscription types to include this option.

### 2. Embed "Manage Trailers" directly in Edit Subscription panel

Currently the Assigned Trailers card is read-only with a note to use "Manage Trailers" from subscription actions. Instead, embed a "Manage Trailers" button that opens the existing `ManageTrailersDialog` right from the Edit panel.

**Change in `EditSubscriptionPanel.tsx`:**
- Import `ManageTrailersDialog`
- Add state: `const [showManageTrailers, setShowManageTrailers] = useState(false)`
- Replace the static hint text with a "Manage Trailers" button
- Render `<ManageTrailersDialog>` with the current subscription's ID, customer ID, and items
- After the dialog closes, invalidate the `subscription-items-detail` query to refresh the list

### Files to change
- **New migration** — `ALTER TYPE subscription_type ADD VALUE 'month_to_month'`
- `src/components/admin/EditSubscriptionPanel.tsx` — add month_to_month type + embed ManageTrailersDialog
- `src/components/admin/CreateSubscriptionDialog.tsx` — add month_to_month option (if not already there)
- `src/integrations/supabase/types.ts` will auto-update after migration

