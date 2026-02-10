
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

CREATE POLICY "Admins can manage dropoff requests"
  ON trailer_dropoff_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mechanics can view dropoff requests"
  ON trailer_dropoff_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'mechanic'));

CREATE POLICY "Mechanics can update dropoff requests"
  ON trailer_dropoff_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'mechanic'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.trailer_dropoff_requests;
