
-- Staff profiles extending user_roles with sales-specific data
CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text UNIQUE,
  position text NOT NULL DEFAULT 'admin',
  hire_date date,
  base_salary numeric DEFAULT 0,
  commission_rate numeric DEFAULT 0.15,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Auto-generate referral code for staff
CREATE OR REPLACE FUNCTION public.generate_staff_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := 'CRUMS-' || upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(
      SELECT 1 FROM staff_profiles WHERE referral_code = new_code
      UNION ALL
      SELECT 1 FROM referral_codes WHERE code = new_code
      UNION ALL
      SELECT 1 FROM partners WHERE referral_code = new_code
    ) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Auto-assign referral code on staff_profiles insert
CREATE OR REPLACE FUNCTION public.auto_assign_staff_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_staff_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_assign_staff_referral_code
  BEFORE INSERT ON public.staff_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_staff_referral_code();

-- Performance reviews table
CREATE TABLE public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.profiles(id),
  review_quarter text NOT NULL,
  performance_rating integer CHECK (performance_rating >= 1 AND performance_rating <= 5),
  notes text,
  goals text,
  ai_summary text,
  bonus_amount numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add staff_referral_id to customer_applications
ALTER TABLE public.customer_applications
  ADD COLUMN staff_referral_id uuid REFERENCES public.staff_profiles(id);

-- Enable RLS
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- RLS for staff_profiles
CREATE POLICY "Admins can manage staff profiles"
  ON public.staff_profiles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view their own profile"
  ON public.staff_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS for performance_reviews
CREATE POLICY "Admins can manage performance reviews"
  ON public.performance_reviews FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view their own reviews"
  ON public.performance_reviews FOR SELECT
  TO authenticated
  USING (staff_id IN (SELECT id FROM staff_profiles WHERE user_id = auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_staff_profiles_updated_at
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON public.performance_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
