-- Create trailer_release_requests table for Sales-to-Mechanic handoff
CREATE TABLE public.trailer_release_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trailer_id UUID NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL,
  assigned_mechanic_id UUID,
  scheduled_pickup_date TIMESTAMPTZ NOT NULL,
  customer_name TEXT,
  customer_company TEXT,
  customer_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'inspection_in_progress', 'ready', 'completed', 'canceled')),
  dot_inspection_id UUID REFERENCES public.dot_inspections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add inspector_name to dot_inspections table
ALTER TABLE public.dot_inspections 
ADD COLUMN IF NOT EXISTS inspector_name TEXT,
ADD COLUMN IF NOT EXISTS release_request_id UUID REFERENCES public.trailer_release_requests(id) ON DELETE SET NULL;

-- Enable RLS on trailer_release_requests
ALTER TABLE public.trailer_release_requests ENABLE ROW LEVEL SECURITY;

-- Admin policies for trailer_release_requests
CREATE POLICY "Admins can view all release requests"
ON public.trailer_release_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert release requests"
ON public.trailer_release_requests FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update release requests"
ON public.trailer_release_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete release requests"
ON public.trailer_release_requests FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Mechanic policies for trailer_release_requests
CREATE POLICY "Mechanics can view pending release requests"
ON public.trailer_release_requests FOR SELECT
USING (has_role(auth.uid(), 'mechanic'::app_role));

CREATE POLICY "Mechanics can update assigned release requests"
ON public.trailer_release_requests FOR UPDATE
USING (has_role(auth.uid(), 'mechanic'::app_role) AND (assigned_mechanic_id = auth.uid() OR assigned_mechanic_id IS NULL));

-- Create index for faster queries
CREATE INDEX idx_trailer_release_requests_status ON public.trailer_release_requests(status);
CREATE INDEX idx_trailer_release_requests_scheduled ON public.trailer_release_requests(scheduled_pickup_date);
CREATE INDEX idx_trailer_release_requests_mechanic ON public.trailer_release_requests(assigned_mechanic_id);

-- Add trigger for updated_at
CREATE TRIGGER update_trailer_release_requests_updated_at
BEFORE UPDATE ON public.trailer_release_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for release requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.trailer_release_requests;