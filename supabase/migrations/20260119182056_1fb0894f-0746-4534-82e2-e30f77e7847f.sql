-- Add INSERT policy for mechanics to create their own maintenance records
CREATE POLICY "Mechanics can insert their maintenance records"
ON public.maintenance_records
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'mechanic'::app_role) 
  AND mechanic_id = auth.uid()
);