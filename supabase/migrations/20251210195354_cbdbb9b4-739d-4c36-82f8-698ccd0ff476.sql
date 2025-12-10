-- Update the create_referral function to prevent self-referrals
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
  v_referrer_email text;
BEGIN
  -- Validate the referral code
  v_code_id := validate_referral_code(p_referral_code);
  
  IF v_code_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or inactive referral code');
  END IF;
  
  -- Get the referrer's email to check for self-referral
  SELECT c.email INTO v_referrer_email
  FROM referral_codes rc
  JOIN customers c ON c.id = rc.customer_id
  WHERE rc.id = v_code_id;
  
  -- Check if user is trying to refer themselves
  IF lower(v_referrer_email) = lower(p_referred_email) THEN
    RETURN json_build_object('success', false, 'error', 'You cannot refer yourself');
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