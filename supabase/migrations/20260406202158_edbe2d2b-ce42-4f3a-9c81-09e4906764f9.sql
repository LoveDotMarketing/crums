
ALTER TABLE public.trailers ADD COLUMN IF NOT EXISTS title_document_url text;

CREATE POLICY "Mechanics can update trailer title document"
ON public.trailers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'mechanic'::app_role))
WITH CHECK (has_role(auth.uid(), 'mechanic'::app_role));
