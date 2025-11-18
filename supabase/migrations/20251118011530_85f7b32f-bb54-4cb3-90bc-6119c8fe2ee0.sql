-- Add RLS policies for mechanics to view and update trailers
CREATE POLICY "Mechanics can view all trailers"
ON public.trailers
FOR SELECT
USING (has_role(auth.uid(), 'mechanic'::app_role));

CREATE POLICY "Mechanics can update trailer status"
ON public.trailers
FOR UPDATE
USING (has_role(auth.uid(), 'mechanic'::app_role))
WITH CHECK (has_role(auth.uid(), 'mechanic'::app_role));