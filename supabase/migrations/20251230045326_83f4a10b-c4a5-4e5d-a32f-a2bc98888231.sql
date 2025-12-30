-- Fix: Restrict customer trailer visibility to only assigned trailers
-- This prevents competitors from viewing entire fleet GPS locations, VINs, etc.

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Customers can view all trailers" ON public.trailers;

-- Create a properly scoped policy that limits customers to their assigned trailers
CREATE POLICY "Customers can view assigned trailers"
  ON public.trailers
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer'::app_role) AND
    (
      customer_id = auth.uid() OR 
      assigned_to = auth.uid()
    )
  );