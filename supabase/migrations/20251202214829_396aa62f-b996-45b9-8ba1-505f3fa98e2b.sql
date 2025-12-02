-- Remove public access to trailers table
DROP POLICY IF EXISTS "Public can view trailers" ON public.trailers;