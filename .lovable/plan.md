

## Plan: MATS 2026 Event Lead Capture Page + Admin Events Tab

### What we are building
1. A public page at `/mats2026` with a simple lead capture form (name, phone, email) -- no login required
2. A new "Events" tab in the Outreach admin panel showing all collected leads
3. A database table to store event leads

### Database

**New table: `event_leads`**
```sql
CREATE TABLE public.event_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL DEFAULT 'MATS 2026',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_leads ENABLE ROW LEVEL SECURITY;

-- Public insert (no auth needed for QR code scans)
CREATE POLICY "Anyone can submit event leads"
  ON public.event_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view/manage
CREATE POLICY "Admins can manage event leads"
  ON public.event_leads FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
```

### New file: `src/pages/MATS2026.tsx`

Public page with CRUMS branding, a short greeting ("Welcome to MATS 2026! Visit us at Booth 38024"), and a form with:
- Full Name (required)
- Email (required)
- Phone (required)
- Optional notes/message field
- Submit button

On submit, inserts directly into `event_leads` via the Supabase client (anon key, no auth). Shows a thank-you confirmation. Include basic input validation (zod).

### Updated file: `src/pages/admin/Outreach.tsx`

Add a new "Events" tab after "Customers" in the TabsList. The tab content:
- Queries `event_leads` ordered by `created_at DESC`
- Displays a table with Name, Email, Phone, Event, Submitted At
- Shows total lead count
- CSV export button (client-side download)

### Updated file: `src/App.tsx`

Add route: `<Route path="/mats2026" element={<MATS2026 />} />`

### Files to create/modify
- **Create**: `src/pages/MATS2026.tsx`
- **Modify**: `src/pages/admin/Outreach.tsx` (add Events tab)
- **Modify**: `src/App.tsx` (add route)
- **Migration**: Create `event_leads` table

