-- Drop existing check constraint and add updated one with 'under_review' status
ALTER TABLE public.trailers DROP CONSTRAINT IF EXISTS trailers_status_check;

ALTER TABLE public.trailers 
ADD CONSTRAINT trailers_status_check 
CHECK (status IN ('available', 'rented', 'in_use', 'maintenance', 'released', 'checked_out', 'pending_release', 'under_review'));