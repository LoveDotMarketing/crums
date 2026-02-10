

## Add Pickup and Drop-off Queue to Mechanic Dashboard

### What This Does
Makes the "Pending Customer Pickups" section always visible on the mechanic dashboard (even when there are no upcoming pickups) and adds a new "Scheduled Drop-offs" section so mechanics can see when customers are returning trailers. Both sections update in real-time.

### Changes

**1. Database: Create `trailer_dropoff_requests` Table**
- New table to track scheduled trailer returns with fields for trailer, customer details, scheduled date, notes, and status
- Statuses: `scheduled`, `received`, `inspected`, `completed`
- RLS policies for admin/mechanic access
- Enable realtime so the mechanic dashboard updates live

**2. Update `PendingReleasesQueue` Component**
- Show an empty state ("No upcoming pickups scheduled") instead of hiding the component when there are zero pending releases
- This ensures the section is always visible on the dashboard

**3. Create `ScheduledDropoffsQueue` Component**
- New component similar to `PendingReleasesQueue` but for trailer returns
- Shows customer name, company, phone, trailer number, and scheduled drop-off date/time
- Urgency badges (OVERDUE, TODAY, TOMORROW) matching the pickup queue style
- "Mark Received" button for the mechanic to acknowledge the trailer has been returned
- Real-time subscription on `trailer_dropoff_requests` table
- Always visible with an empty state when there are no upcoming drop-offs

**4. Add Drop-off Queue to Mechanic Dashboard**
- Render `ScheduledDropoffsQueue` alongside the existing `PendingReleasesQueue`
- Positioned right after the pickups queue so both are visible together

**5. Admin: Add Schedule Drop-off Capability**
- Create a `ScheduleDropoffDialog` component for admins to schedule a trailer return from the Fleet page
- Fields: customer (auto-populated from assigned trailer), scheduled return date/time, notes
- Available on rented trailers in the admin Fleet view

### Technical Details

**Migration SQL:**
```sql
CREATE TABLE public.trailer_dropoff_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trailer_id uuid NOT NULL REFERENCES trailers(id),
  customer_id uuid REFERENCES customers(id),
  scheduled_by uuid NOT NULL REFERENCES auth.users(id),
  customer_name text,
  customer_company text,
  customer_phone text,
  scheduled_dropoff_date timestamptz NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  received_by uuid REFERENCES auth.users(id),
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trailer_dropoff_requests ENABLE ROW LEVEL SECURITY;

-- Admin and mechanic read/write policies
CREATE POLICY "Admins can manage dropoff requests"
  ON trailer_dropoff_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mechanics can view and update dropoff requests"
  ON trailer_dropoff_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'mechanic'));

CREATE POLICY "Mechanics can update dropoff requests"
  ON trailer_dropoff_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'mechanic'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.trailer_dropoff_requests;
```

**New files:**
- `src/components/mechanic/ScheduledDropoffsQueue.tsx` -- drop-off queue component
- `src/components/admin/ScheduleDropoffDialog.tsx` -- admin scheduling dialog

**Modified files:**
- `src/components/mechanic/PendingReleasesQueue.tsx` -- show empty state instead of hiding
- `src/pages/mechanic/MechanicDashboard.tsx` -- add drop-off queue import and render
- `src/pages/admin/Fleet.tsx` -- add schedule drop-off button for rented trailers
