-- Create fleet activity logs table
CREATE TABLE public.fleet_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trailer_id UUID NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  previous_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  new_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_fleet_activity_logs_trailer_id ON public.fleet_activity_logs(trailer_id);
CREATE INDEX idx_fleet_activity_logs_performed_by ON public.fleet_activity_logs(performed_by);
CREATE INDEX idx_fleet_activity_logs_created_at ON public.fleet_activity_logs(created_at DESC);
CREATE INDEX idx_fleet_activity_logs_action_type ON public.fleet_activity_logs(action_type);

-- Add comment for documentation
COMMENT ON TABLE public.fleet_activity_logs IS 'Tracks all fleet operations including check-ins, check-outs, status changes, and assignments';

-- Enable RLS
ALTER TABLE public.fleet_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage fleet activity logs"
ON public.fleet_activity_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Mechanics can insert their own logs
CREATE POLICY "Mechanics can insert their activity logs"
ON public.fleet_activity_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'mechanic') AND performed_by = auth.uid());

-- Mechanics can view all logs (for transparency)
CREATE POLICY "Mechanics can view all activity logs"
ON public.fleet_activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'mechanic'));

-- Enable realtime for activity logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_activity_logs;