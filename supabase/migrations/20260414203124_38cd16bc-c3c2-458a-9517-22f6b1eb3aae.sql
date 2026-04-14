-- Drop and recreate the three user-facing policies with 'authenticated' role

DROP POLICY IF EXISTS "Users can insert their own application" ON public.customer_applications;
CREATE POLICY "Users can insert their own application"
  ON public.customer_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own application" ON public.customer_applications;
CREATE POLICY "Users can update their own application"
  ON public.customer_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own application" ON public.customer_applications;
CREATE POLICY "Users can view their own application"
  ON public.customer_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);