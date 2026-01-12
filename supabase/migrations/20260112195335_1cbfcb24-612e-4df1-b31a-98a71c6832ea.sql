-- Add columns to track toll reminders
ALTER TABLE public.tolls 
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Add toll reminder settings to outreach_settings if not exists
INSERT INTO public.outreach_settings (setting_key, setting_value, description)
VALUES 
  ('toll_reminder_enabled', 'true', 'Enable automated toll reminder emails'),
  ('toll_reminder_interval_days', '3', 'Days between toll reminder emails')
ON CONFLICT (setting_key) DO NOTHING;