

## Mechanic Work Order and Invoice System

### What This Does
Gives the mechanic a way to create detailed work orders with itemized labor and parts costs, submit them for leadership review, and get them approved for payment. The mechanic charges $85/hour for labor and a flat $75 travel fee when applicable.

### How It Works

**Mechanic creates a work order tied to a trailer:**
- Selects repair type (Preventative Maintenance, Yard Repair, Safety/DOT, Emergency Repair)
- Adds repair description, start date, completion date
- Adds labor: hours worked at $85/hr (auto-calculated), optional $75 travel fee
- Adds parts: each part with name, quantity, unit cost (auto-calculated line totals)
- Uploads work order document (PDF/image) and optional before/after photos
- Submits -- entry becomes read-only for the mechanic

**Leadership reviews and approves:**
- Admin dashboard shows submitted work orders awaiting review
- Admin can Approve, Reject, or Request More Info
- Approved work orders are released for payment
- Approval fingerprint (who approved and when) is recorded

**Visibility rules from your document:**
- Mechanic: Create and submit only
- Leadership: Full view and approval
- Accounting: View approved work orders
- Customers: No access

### Changes

**1. Database: Create `work_orders` and `work_order_line_items` tables**

`work_orders` table:
- `trailer_id` -- linked to the trailer
- `mechanic_id` -- who performed the work
- `repair_type` -- Preventative Maintenance, Yard Repair, Safety/DOT, Emergency Repair
- `description` -- what was done
- `work_start_date`, `work_completion_date`
- `labor_hours`, `labor_rate` (default $85), `travel_fee` (default $0, set to $75 when applicable)
- `labor_total` -- auto-calculated (hours x rate + travel fee)
- `parts_total` -- sum of line items
- `grand_total` -- labor_total + parts_total
- `invoice_document_url` -- uploaded work order PDF/image
- `photo_urls` -- before/after photos (JSON array)
- `status` -- in_progress, submitted, under_review, approved, rejected, needs_info
- `approved_by`, `approved_at`, `approval_notes`
- `submitted_at`

`work_order_line_items` table:
- `work_order_id` -- parent work order
- `item_type` -- "part" or "labor"
- `description` -- part name or labor description
- `quantity`
- `unit_cost`
- `line_total` -- quantity x unit_cost

RLS: mechanic can create/read own, admin can read/update all.

**2. New Component: `WorkOrderForm.tsx`**
- Multi-section form the mechanic fills out
- Labor section: hours input, $85/hr auto-populated, travel fee toggle ($75)
- Parts section: dynamic rows to add parts (name, qty, unit cost) with running totals
- File upload for invoice document
- Optional photo uploads
- Submit button locks the work order

**3. New Page: `src/pages/mechanic/WorkOrders.tsx`**
- List of mechanic's work orders with status badges
- "New Work Order" button opens the form
- Click a work order to view details (read-only after submission)

**4. Mechanic Dashboard Integration**
- Add "Work Orders" section/tab to the mechanic dashboard
- Show count of in-progress and submitted work orders

**5. Admin Work Orders Review Page: `src/pages/admin/WorkOrders.tsx`**
- Table of all submitted work orders
- Click to view full breakdown (labor, parts, totals, documents)
- Approve / Reject / Request Info buttons
- Approval logs who approved and when
- Add route and sidebar link

### Technical Details

**Migration SQL:**
```sql
CREATE TABLE public.work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trailer_id uuid NOT NULL REFERENCES trailers(id),
  mechanic_id uuid NOT NULL REFERENCES auth.users(id),
  repair_type text NOT NULL,
  description text NOT NULL,
  work_start_date date NOT NULL,
  work_completion_date date,
  labor_hours numeric NOT NULL DEFAULT 0,
  labor_rate numeric NOT NULL DEFAULT 85,
  travel_fee numeric NOT NULL DEFAULT 0,
  labor_total numeric GENERATED ALWAYS AS (labor_hours * labor_rate + travel_fee) STORED,
  parts_total numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL DEFAULT 0,
  invoice_document_url text,
  photo_urls jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'in_progress',
  submitted_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  approval_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.work_order_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'part',
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_cost numeric NOT NULL DEFAULT 0,
  line_total numeric GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_line_items ENABLE ROW LEVEL SECURITY;

-- Mechanic: create and read own work orders
CREATE POLICY "Mechanics can manage own work orders"
  ON work_orders FOR ALL
  USING (mechanic_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Admin: full access
CREATE POLICY "Admins can manage all work orders"
  ON work_orders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Line items follow parent
CREATE POLICY "Users can manage line items for accessible work orders"
  ON work_order_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM work_orders
      WHERE work_orders.id = work_order_line_items.work_order_id
      AND (work_orders.mechanic_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.work_orders;
```

**New files:**
- `src/pages/mechanic/WorkOrders.tsx` -- mechanic's work order list and form
- `src/components/mechanic/WorkOrderForm.tsx` -- the detailed creation form
- `src/pages/admin/WorkOrders.tsx` -- admin review page

**Modified files:**
- `src/pages/mechanic/MechanicDashboard.tsx` -- add work orders summary/link
- `src/components/admin/AdminSidebar.tsx` -- add Work Orders link
- `src/App.tsx` -- add routes for `/dashboard/mechanic/work-orders` and `/dashboard/admin/work-orders`

