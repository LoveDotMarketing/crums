-- Add maintenance and tracking fields to trailers table
ALTER TABLE public.trailers
ADD COLUMN IF NOT EXISTS year_purchased integer,
ADD COLUMN IF NOT EXISTS purchase_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_maintenance_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_rented boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rental_income numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS gps_latitude numeric,
ADD COLUMN IF NOT EXISTS gps_longitude numeric,
ADD COLUMN IF NOT EXISTS last_location_update timestamp with time zone;

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trailer_id uuid NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  mechanic_id uuid REFERENCES public.profiles(id),
  description text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  maintenance_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on maintenance_records
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for maintenance_records
CREATE POLICY "Admins can view all maintenance records"
ON public.maintenance_records
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert maintenance records"
ON public.maintenance_records
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update maintenance records"
ON public.maintenance_records
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete maintenance records"
ON public.maintenance_records
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mechanics can view their maintenance records"
ON public.maintenance_records
FOR SELECT
USING (has_role(auth.uid(), 'mechanic'::app_role) AND mechanic_id = auth.uid());

CREATE POLICY "Mechanics can update their maintenance records"
ON public.maintenance_records
FOR UPDATE
USING (has_role(auth.uid(), 'mechanic'::app_role) AND mechanic_id = auth.uid());

-- Add trigger for maintenance_records updated_at
CREATE TRIGGER update_maintenance_records_updated_at
BEFORE UPDATE ON public.maintenance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();