-- Drop the existing customer trailer view policy
DROP POLICY IF EXISTS "Customers can view assigned trailers" ON public.trailers;

-- Create a new policy that correctly links trailers to customers via email
CREATE POLICY "Customers can view assigned trailers" 
ON public.trailers 
FOR SELECT 
USING (
  has_role(auth.uid(), 'customer'::app_role) AND (
    -- Link through customers table via email matching
    customer_id IN (
      SELECT c.id 
      FROM customers c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
    OR assigned_to = auth.uid()
  )
);