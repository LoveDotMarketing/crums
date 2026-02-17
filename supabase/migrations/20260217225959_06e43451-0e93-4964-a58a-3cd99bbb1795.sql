
-- Drop the overly restrictive update policy
DROP POLICY "Users can update their own pending application" ON public.customer_applications;

-- Create a new policy that lets customers update their own application
-- (they can only update their own row, status changes are controlled by admin policies)
CREATE POLICY "Users can update their own application"
ON public.customer_applications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
