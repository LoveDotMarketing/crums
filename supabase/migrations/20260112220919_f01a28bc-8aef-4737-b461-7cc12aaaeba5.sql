-- Add rental rate and frequency columns to trailers table
ALTER TABLE public.trailers 
ADD COLUMN IF NOT EXISTS rental_rate numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rental_frequency text DEFAULT 'monthly';