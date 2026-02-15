-- Add UPDATE policy for dot-inspection-photos bucket (currently missing)
CREATE POLICY "Mechanics can update their inspection photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'dot-inspection-photos' AND has_role(auth.uid(), 'mechanic'::app_role));

-- Broaden INSERT policy to also allow active inspectors
DROP POLICY IF EXISTS "Mechanics can upload inspection photos" ON storage.objects;
CREATE POLICY "Mechanics can upload inspection photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dot-inspection-photos'
  AND (
    has_role(auth.uid(), 'mechanic'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.dot_inspections
      WHERE inspector_id = auth.uid()
      AND status = 'in_progress'
    )
  )
);