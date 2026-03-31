
-- Add lead_type and unsubscribed columns to event_leads
ALTER TABLE public.event_leads 
  ADD COLUMN IF NOT EXISTS lead_type text NOT NULL DEFAULT 'prospect',
  ADD COLUMN IF NOT EXISTS unsubscribed boolean NOT NULL DEFAULT false;

-- Add opened_at column to outreach_logs
ALTER TABLE public.outreach_logs 
  ADD COLUMN IF NOT EXISTS opened_at timestamptz;

-- Create increment functions for campaign tracking if not exist
CREATE OR REPLACE FUNCTION public.increment_campaign_sent(campaign_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE email_campaigns SET sent_count = COALESCE(sent_count, 0) + 1 WHERE id = campaign_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_campaign_failed(campaign_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE email_campaigns SET failed_count = COALESCE(failed_count, 0) + 1 WHERE id = campaign_uuid;
END;
$$;
