
-- Create phone_leads table
CREATE TABLE public.phone_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  converted_customer_id uuid REFERENCES public.customers(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_leads ENABLE ROW LEVEL SECURITY;

-- Admin full CRUD
CREATE POLICY "Admins can manage phone leads"
  ON public.phone_leads FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role insert (for edge function)
CREATE POLICY "Service role can insert phone leads"
  ON public.phone_leads FOR INSERT
  TO public
  WITH CHECK (true);

-- updated_at trigger
CREATE TRIGGER update_phone_leads_updated_at
  BEFORE UPDATE ON public.phone_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Conversion trigger function
CREATE OR REPLACE FUNCTION public.auto_convert_phone_lead()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.phone_leads
  SET status = 'converted',
      converted_customer_id = NEW.id
  WHERE status != 'converted'
    AND (
      (phone IS NOT NULL AND phone != '' AND phone = NEW.phone)
      OR (email IS NOT NULL AND email != '' AND lower(email) = lower(NEW.email))
    );
  RETURN NEW;
END;
$$;

-- Trigger on customers table
CREATE TRIGGER auto_convert_phone_lead_on_customer
  AFTER INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_convert_phone_lead();
