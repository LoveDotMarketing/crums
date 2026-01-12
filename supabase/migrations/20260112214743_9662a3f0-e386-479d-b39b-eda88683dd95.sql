-- Add missing DELETE policy for customer_outreach_status
CREATE POLICY "Admins can delete outreach status" 
ON public.customer_outreach_status
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));