CREATE POLICY "Staff can view trailer photos"
ON public.trailer_photos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'sales'::app_role)
  OR has_role(auth.uid(), 'mechanic'::app_role)
);