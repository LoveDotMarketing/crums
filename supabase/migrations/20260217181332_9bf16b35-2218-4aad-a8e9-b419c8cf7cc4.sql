
-- Create a unified event log table for customer flow tracking and admin actions
CREATE TABLE public.app_event_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NULL,
  user_email text NULL,
  event_category text NOT NULL, -- 'customer_flow', 'admin_action', 'error', 'system'
  event_type text NOT NULL, -- e.g. 'signup_started', 'signup_failed', 'profile_saved', 'toll_assigned', 'subscription_created'
  description text NULL, -- Human-readable description
  metadata jsonb NULL DEFAULT '{}'::jsonb, -- Flexible details (error messages, form data, target IDs, etc.)
  page_url text NULL, -- Which page the event happened on
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_app_event_logs_category ON public.app_event_logs(event_category);
CREATE INDEX idx_app_event_logs_type ON public.app_event_logs(event_type);
CREATE INDEX idx_app_event_logs_user ON public.app_event_logs(user_id);
CREATE INDEX idx_app_event_logs_created ON public.app_event_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.app_event_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "Admins can view all event logs"
ON public.app_event_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete logs
CREATE POLICY "Admins can delete event logs"
ON public.app_event_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Any authenticated user can insert logs (for customer flow tracking)
CREATE POLICY "Authenticated users can insert event logs"
ON public.app_event_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow anonymous inserts for signup failures (before auth exists)
CREATE POLICY "Anonymous can insert event logs"
ON public.app_event_logs
FOR INSERT
WITH CHECK (true);

-- Enable realtime for live admin monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_event_logs;
