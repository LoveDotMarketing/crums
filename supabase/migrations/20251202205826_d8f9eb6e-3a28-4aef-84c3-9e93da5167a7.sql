-- Create customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending')),
  archived_at timestamp with time zone,
  archived_by text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all customers"
ON public.customers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert customers"
ON public.customers FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update customers"
ON public.customers FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete customers"
ON public.customers FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add customer_id to trailers table for linking
ALTER TABLE public.trailers ADD COLUMN customer_id uuid REFERENCES public.customers(id);

-- Create index for faster lookups
CREATE INDEX idx_trailers_customer_id ON public.trailers(customer_id);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_account_number ON public.customers(account_number);

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();