-- Create referral_codes table to store unique referral codes for customers
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_customer_referral_code UNIQUE (customer_id)
);

-- Create referrals table to track referral relationships
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_code_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  referred_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'credited')),
  credit_amount numeric DEFAULT 250,
  approved_at timestamp with time zone,
  credited_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Admins can view all referral codes"
  ON public.referral_codes FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update referral codes"
  ON public.referral_codes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete referral codes"
  ON public.referral_codes FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Allow customers to view their own referral code (via customer_id lookup)
-- Note: This requires a subquery to match customer email to profile email
CREATE POLICY "Customers can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (
    has_role(auth.uid(), 'customer') AND
    customer_id IN (
      SELECT c.id FROM customers c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
  );

-- Public can check if a referral code exists (for validation during signup)
CREATE POLICY "Anyone can check referral code validity"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- RLS Policies for referrals
CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update referrals"
  ON public.referrals FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete referrals"
  ON public.referrals FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Customers can view referrals they made (as referrer)
CREATE POLICY "Customers can view their referrals"
  ON public.referrals FOR SELECT
  USING (
    has_role(auth.uid(), 'customer') AND
    referrer_code_id IN (
      SELECT rc.id FROM referral_codes rc
      JOIN customers c ON c.id = rc.customer_id
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
  );

-- Allow public to insert referrals (for tracking during signup)
CREATE POLICY "Anyone can create a referral"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a code like CRUMS-ABC123
    new_code := 'CRUMS-' || upper(substr(md5(random()::text), 1, 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create trigger to auto-generate referral code when customer is created
CREATE OR REPLACE FUNCTION create_referral_code_for_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO referral_codes (customer_id, code)
  VALUES (NEW.id, generate_referral_code());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_customer_created_create_referral_code
  AFTER INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_code_for_customer();

-- Create indexes for better query performance
CREATE INDEX idx_referral_codes_customer_id ON public.referral_codes(customer_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer_code_id ON public.referrals(referrer_code_id);
CREATE INDEX idx_referrals_referred_email ON public.referrals(referred_email);
CREATE INDEX idx_referrals_status ON public.referrals(status);