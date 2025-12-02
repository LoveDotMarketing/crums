-- Allow public/anonymous users to view trailers
CREATE POLICY "Public can view trailers" ON public.trailers
FOR SELECT TO anon USING (true);