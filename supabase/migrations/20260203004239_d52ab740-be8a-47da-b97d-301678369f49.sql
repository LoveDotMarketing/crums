-- Add GPS box number column to trailers table
ALTER TABLE public.trailers ADD COLUMN IF NOT EXISTS gps_box_number text;