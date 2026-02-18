-- Create customer_statements table
CREATE TABLE public.customer_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  statement_date date NOT NULL,
  period_start date,
  period_end date,
  amount numeric NOT NULL DEFAULT 0,
  description text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  file_url text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_statements ENABLE ROW LEVEL SECURITY;

-- Admin: full CRUD
CREATE POLICY "Admins can manage customer statements"
ON public.customer_statements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Customer: SELECT only their own records
CREATE POLICY "Customers can view their own statements"
ON public.customer_statements
FOR SELECT
USING (
  has_role(auth.uid(), 'customer'::app_role)
  AND customer_id IN (
    SELECT c.id
    FROM customers c
    JOIN profiles p ON lower(p.email) = lower(c.email)
    WHERE p.id = auth.uid()
  )
);

-- Updated_at trigger
CREATE TRIGGER update_customer_statements_updated_at
BEFORE UPDATE ON public.customer_statements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();