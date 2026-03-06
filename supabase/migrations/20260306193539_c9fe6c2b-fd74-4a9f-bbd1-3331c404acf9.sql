
ALTER TABLE public.trailers DROP CONSTRAINT trailers_status_check;
ALTER TABLE public.trailers ADD CONSTRAINT trailers_status_check CHECK (status = ANY (ARRAY['available','pending','rented','maintenance','checked_out','released','under_review','archived']));
