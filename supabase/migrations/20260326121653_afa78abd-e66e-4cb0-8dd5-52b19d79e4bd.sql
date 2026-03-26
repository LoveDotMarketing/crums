
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

CREATE POLICY "Anyone can submit event leads"
  ON public.event_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage event leads"
  ON public.event_leads FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
