CREATE OR REPLACE FUNCTION public.get_my_referral_code()
RETURNS TABLE(id uuid, code text, is_active boolean, customer_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rc.id, rc.code, rc.is_active, rc.customer_id
  FROM referral_codes rc
  JOIN customers c ON c.id = rc.customer_id
  JOIN profiles p ON lower(p.email) = lower(c.email)
  WHERE p.id = auth.uid();
$$;