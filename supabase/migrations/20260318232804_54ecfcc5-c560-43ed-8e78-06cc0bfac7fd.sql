
-- Create work_order_photos table
CREATE TABLE public.work_order_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.work_order_photos ENABLE ROW LEVEL SECURITY;

-- Mechanics can manage photos on their own work orders
CREATE POLICY "Mechanics can manage their work order photos"
ON public.work_order_photos
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM work_orders
    WHERE work_orders.id = work_order_photos.work_order_id
      AND work_orders.mechanic_id = auth.uid()
  )
);

-- Admins can manage all work order photos
CREATE POLICY "Admins can manage all work order photos"
ON public.work_order_photos
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-order-photos', 'work-order-photos', true);

-- Storage RLS: mechanics can upload to work-order-photos bucket
CREATE POLICY "Mechanics can upload work order photos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'work-order-photos'
  AND (has_role(auth.uid(), 'mechanic'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Mechanics and admins can delete their work order photos
CREATE POLICY "Mechanics and admins can delete work order photos"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'work-order-photos'
  AND (has_role(auth.uid(), 'mechanic'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Anyone can read public work order photos
CREATE POLICY "Public read work order photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'work-order-photos');
