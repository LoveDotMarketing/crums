CREATE TABLE public.partner_referred_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  company_name text,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'lead',
  linked_customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  linked_subscription_id uuid REFERENCES public.customer_subscriptions(id) ON DELETE SET NULL,
  notes text,
  referred_at date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_referred_customers_partner ON public.partner_referred_customers(partner_id);
CREATE INDEX idx_partner_referred_customers_linked_customer ON public.partner_referred_customers(linked_customer_id);

ALTER TABLE public.partner_referred_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage partner referred customers"
  ON public.partner_referred_customers
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sales can view partner referred customers"
  ON public.partner_referred_customers
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'sales'::app_role));

CREATE TRIGGER update_partner_referred_customers_updated_at
  BEFORE UPDATE ON public.partner_referred_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();