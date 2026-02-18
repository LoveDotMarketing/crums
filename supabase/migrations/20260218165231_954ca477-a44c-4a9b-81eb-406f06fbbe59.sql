
-- Create partners table
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text,
  email text,
  phone text,
  referral_code text UNIQUE NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0.15,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Admin-only RLS policy on partners
CREATE POLICY "Admins can manage partners"
  ON public.partners
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add partner_id to customer_subscriptions
ALTER TABLE public.customer_subscriptions
  ADD COLUMN partner_id uuid REFERENCES public.partners(id);

-- Create partner_commissions table
CREATE TABLE public.partner_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id),
  subscription_id uuid NOT NULL REFERENCES public.customer_subscriptions(id),
  billing_history_id uuid REFERENCES public.billing_history(id),
  commission_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  billing_period_start date,
  billing_period_end date,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on partner_commissions
ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

-- Admin-only RLS policy on partner_commissions
CREATE POLICY "Admins can manage partner commissions"
  ON public.partner_commissions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger for partners
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for partner_commissions
CREATE TRIGGER update_partner_commissions_updated_at
  BEFORE UPDATE ON public.partner_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
