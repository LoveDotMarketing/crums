
-- Create trailer_photos table
CREATE TABLE public.trailer_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trailer_id uuid NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trailer_photos ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage trailer photos"
ON public.trailer_photos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('trailer-photos', 'trailer-photos', true);

-- Storage policies
CREATE POLICY "Admins can upload trailer photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trailer-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete trailer photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'trailer-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view trailer photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'trailer-photos');
