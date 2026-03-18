

## Phone Lead Tracking System (Simplified)

### What We're Building
An API endpoint and admin page to track leads collected from outbound phone calls — no agent name tracking.

### Database: `phone_leads` Table

| Column | Type | Required | Default |
|---|---|---|---|
| id | uuid PK | auto | gen_random_uuid() |
| name | text | yes | — |
| phone | text | yes | — |
| email | text | no | — |
| notes | text | no | — |
| status | text | yes | 'new' |
| converted_customer_id | uuid | no | — |
| created_at | timestamptz | auto | now() |
| updated_at | timestamptz | auto | now() |

Status values: `new`, `contacted`, `converted`, `lost`

RLS: Admin full CRUD. Open INSERT for service role (edge function uses service role key).

### Conversion Trigger
A trigger on the `customers` table (fires after INSERT) that checks if the new customer's email or phone matches a `phone_leads` record with status != 'converted'. If matched, sets `status = 'converted'` and `converted_customer_id`.

### Edge Function: `create-phone-lead`
- Auth: `N8N_AGENT_SECRET` bearer token (same as existing agent endpoints)
- POST: `{ name, phone, email?, notes? }`
- Validates `name` and `phone` are present
- Inserts into `phone_leads`, returns created record
- Config: `verify_jwt = false`

### Admin UI: Phone Leads Page
New page at `/dashboard/admin/phone-leads`:
- Table: Name, Phone, Email, Status, Date
- Status badge colors (new=blue, contacted=yellow, converted=green, lost=gray)
- Inline status update dropdown
- Simple count stats at top (total, converted)

### Sidebar & Route
- Add "Phone Leads" to Marketing group in `AdminSidebar.tsx`
- Add route in `App.tsx`

### Files to Create/Update
1. **Migration** — `phone_leads` table + conversion trigger + `updated_at` trigger
2. `supabase/functions/create-phone-lead/index.ts` — edge function
3. `supabase/config.toml` — add entry
4. `src/pages/admin/PhoneLeads.tsx` — new page
5. `src/components/admin/AdminSidebar.tsx` — add nav link
6. `src/App.tsx` — add route

