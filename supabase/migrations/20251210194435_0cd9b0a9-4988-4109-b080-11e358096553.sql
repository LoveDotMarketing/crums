-- Create a SECURITY DEFINER function to validate referral codes
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id uuid;
BEGIN
  SELECT id INTO v_code_id
  FROM referral_codes
  WHERE code = p_code
    AND is_active = true;
  
  RETURN v_code_id;
END;
$$;

-- Create a SECURITY DEFINER function to create referrals safely
CREATE OR REPLACE FUNCTION public.create_referral(
  p_referral_code text,
  p_referred_email text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id uuid;
  v_referral_id uuid;
  v_existing_referral uuid;
BEGIN
  -- Validate the referral code
  v_code_id := validate_referral_code(p_referral_code);
  
  IF v_code_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or inactive referral code');
  END IF;
  
  -- Check if this email has already been referred
  SELECT id INTO v_existing_referral
  FROM referrals
  WHERE referred_email = lower(p_referred_email);
  
  IF v_existing_referral IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'This email has already been referred');
  END IF;
  
  -- Create the referral
  INSERT INTO referrals (referrer_code_id, referred_email, status)
  VALUES (v_code_id, lower(p_referred_email), 'pending')
  RETURNING id INTO v_referral_id;
  
  RETURN json_build_object('success', true, 'referral_id', v_referral_id);
END;
$$;

-- Drop the insecure "Anyone can create a referral" policy
DROP POLICY IF EXISTS "Anyone can create a referral" ON public.referrals;

-- Create a new policy that only allows authenticated users to create referrals
CREATE POLICY "Authenticated users can create referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (true);