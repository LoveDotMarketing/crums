
-- Work orders table
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

-- Work order line items table
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

-- Enable RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_line_items ENABLE ROW LEVEL SECURITY;

-- Mechanic: manage own work orders
CREATE POLICY "Mechanics can manage own work orders"
  ON work_orders FOR ALL
  USING (mechanic_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Admin: full access
CREATE POLICY "Admins can manage all work orders"
  ON work_orders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Line items follow parent work order access
CREATE POLICY "Users can manage line items for accessible work orders"
  ON work_order_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM work_orders
      WHERE work_orders.id = work_order_line_items.work_order_id
      AND (work_orders.mechanic_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_orders;

-- Updated at trigger
CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
