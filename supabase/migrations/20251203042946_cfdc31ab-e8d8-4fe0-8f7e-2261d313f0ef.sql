-- Allow customers to view their own customer record (matched by email)
CREATE POLICY "Customers can view their own customer record"
ON public.customers
FOR SELECT
USING (
  has_role(auth.uid(), 'customer'::app_role) 
  AND email = (SELECT email FROM profiles WHERE id = auth.uid())
);