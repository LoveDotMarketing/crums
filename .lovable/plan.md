## Fix: Toll Management page shows "No tolls" even though 12 tolls exist

### Root cause

The `tolls` table is missing a foreign key from `tolls.customer_id` → `customers.id`. The admin Tolls page runs:

```ts
supabase.from("tolls").select(`
  ...,
  customers:customer_id(full_name, company_name, email),
  trailers(trailer_number)
`)
```

PostgREST can't resolve the `customers:customer_id(...)` embed without an FK and returns:

> `PGRST200 — Could not find a relationship between 'tolls' and 'customer_id' in the schema cache`

The whole query 400s, the page catches the error and renders the empty state. All 12 tolls (and Eric's admin role) are intact — the data is there, the UI just can't fetch it. This was working before because the `customers` row was likely embedded by a different name historically; one of the recent schema/embed changes referenced in memory broke the FK assumption.

`tolls.trailer_id` already has a proper FK so that embed is fine — only `customer_id` is missing.

### Changes

**1. New migration — add the missing foreign key**

```sql
ALTER TABLE public.tolls
  ADD CONSTRAINT tolls_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.customers(id)
  ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
```

This is safe: every existing `customer_id` in `tolls` already points at a real `customers.id` (verified — 12/12 rows resolve). `ON DELETE CASCADE` matches how `Customers.tsx` already manually cleans up tolls when archiving a customer.

The `NOTIFY pgrst` line forces PostgREST to refresh its schema cache so the embed resolves immediately without waiting for an idle reload.

### No code changes needed

`Tolls.tsx`, `TollFormDialog.tsx`, the customer dashboard toll list, the admin dashboard "Pending Tolls" widget, and `charge-toll` / `send-toll-email` / `send-toll-reminders` edge functions all work correctly once the FK exists. Eric's admin role and the RLS policies are already correct.

### Verification

1. After migration runs, reload `/dashboard/admin/tolls` as Eric (or any admin):
   - Stat cards show **Pending Tolls $1,514.65 (12 tolls)** instead of $0.
   - Table shows all 12 rows with customer names, authorities, and dates.
2. Filter dropdown by All / Pending / Overdue / Paid still works.
3. "Add Toll" → assign a new toll to a customer → it appears in the list.
4. The customer-side `/dashboard/customer` toll list (CustomerDashboard.tsx) keeps working — it doesn't use the embed and was never broken.

### Out of scope

- No changes to the toll workflow itself (charging, photo upload, customer email reminders) — those edge functions already work.
- No RLS changes — Eric and other admins were never blocked; the SELECT was failing before RLS even applied.
