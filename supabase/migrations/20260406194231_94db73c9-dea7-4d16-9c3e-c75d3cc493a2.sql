DROP POLICY IF EXISTS "Customers can view their own customer record" ON public.customers;

CREATE POLICY "Customers can view their own customer record"
ON public.customers
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'customer'::app_role)
  AND lower(email) = lower((
    SELECT p.email
    FROM public.profiles p
    WHERE p.id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Customers can view their own referral code" ON public.referral_codes;

CREATE POLICY "Customers can view their own referral code"
ON public.referral_codes
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'customer'::app_role)
  AND customer_id IN (
    SELECT c.id
    FROM public.customers c
    JOIN public.profiles p
      ON lower(p.email) = lower(c.email)
    WHERE p.id = auth.uid()
  )
);