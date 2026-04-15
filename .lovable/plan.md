

## Plan: Add Realtime Updates to Phone Leads Dashboard

**Problem**: When a lead is updated via the `create-phone-lead` edge function (e.g., from Bland AI), the Phone Leads dashboard doesn't reflect the changes until you manually refresh the page.

**Solution**: Enable realtime on the `phone_leads` table and subscribe to changes in the dashboard component so it auto-refreshes when leads are created or updated.

### Changes

1. **Database migration** — Enable realtime for `phone_leads`:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE phone_leads;
   ```

2. **`src/pages/admin/PhoneLeads.tsx`** — Add a Supabase realtime subscription that invalidates the `["phone-leads"]` React Query cache on any INSERT, UPDATE, or DELETE event. This triggers an automatic refetch so the table updates live.

