-- Create user activity logs table
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'session_start', 'session_end'
  ip_address TEXT,
  user_agent TEXT,
  session_duration_seconds INTEGER, -- populated on logout/session_end
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_event_type ON public.user_activity_logs(event_type);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow inserts from authenticated users (for tracking their own activity)
CREATE POLICY "Authenticated users can insert their own logs"
ON public.user_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can delete old logs for cleanup
CREATE POLICY "Admins can delete activity logs"
ON public.user_activity_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));