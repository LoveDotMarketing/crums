-- Allow users to view their own customer application
CREATE POLICY "Users can view their own application"
ON public.customer_applications
FOR SELECT
USING (auth.uid() = user_id);