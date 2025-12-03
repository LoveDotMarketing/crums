-- Create email_templates table for storing reusable email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'custom',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_campaigns table for tracking email campaigns
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  subject TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  target_audience TEXT NOT NULL DEFAULT 'all',
  custom_recipients UUID[] DEFAULT '{}',
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outreach_logs table for tracking individual email sends
CREATE TABLE public.outreach_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id),
  customer_id UUID REFERENCES public.customers(id),
  email TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  email_type TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outreach_settings table for automation configuration
CREATE TABLE public.outreach_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_outreach_status table for tracking customer engagement
CREATE TABLE public.customer_outreach_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) UNIQUE NOT NULL,
  welcome_sent_at TIMESTAMP WITH TIME ZONE,
  password_set_at TIMESTAMP WITH TIME ZONE,
  profile_completed_at TIMESTAMP WITH TIME ZONE,
  last_password_reminder_at TIMESTAMP WITH TIME ZONE,
  last_profile_reminder_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,
  unsubscribed BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_outreach_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can view all templates" ON public.email_templates
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert templates" ON public.email_templates
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update templates" ON public.email_templates
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete templates" ON public.email_templates
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for email_campaigns
CREATE POLICY "Admins can view all campaigns" ON public.email_campaigns
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert campaigns" ON public.email_campaigns
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update campaigns" ON public.email_campaigns
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete campaigns" ON public.email_campaigns
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for outreach_logs
CREATE POLICY "Admins can view all logs" ON public.outreach_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert logs" ON public.outreach_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for outreach_settings
CREATE POLICY "Admins can view settings" ON public.outreach_settings
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings" ON public.outreach_settings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings" ON public.outreach_settings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for customer_outreach_status
CREATE POLICY "Admins can view all outreach status" ON public.customer_outreach_status
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert outreach status" ON public.customer_outreach_status
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update outreach status" ON public.customer_outreach_status
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at columns
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_outreach_status_updated_at
  BEFORE UPDATE ON public.customer_outreach_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.outreach_settings (setting_key, setting_value, description) VALUES
  ('welcome_email_enabled', 'true', 'Send welcome emails to new customers'),
  ('password_reminder_enabled', 'true', 'Send password setup reminders'),
  ('password_reminder_days', '3', 'Days between password reminders'),
  ('profile_reminder_enabled', 'true', 'Send profile completion reminders'),
  ('profile_reminder_days', '3', 'Days between profile reminders'),
  ('max_reminders', '5', 'Maximum number of reminders to send'),
  ('from_name', 'CRUMS Leasing', 'Default sender name'),
  ('reply_to', 'sales@crumsleasing.com', 'Default reply-to email');

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, body, template_type, is_active) VALUES
  ('Welcome Email', 'Welcome to CRUMS Leasing - Set Up Your Account', '<h1>Welcome to CRUMS Leasing!</h1><p>Hello {{customer_name}},</p><p>We''re excited to have you as part of the CRUMS family! Your account has been created and is ready for you to set up.</p><p>To get started, please click the link below to set your password and complete your profile:</p><p><a href="{{login_url}}">Set Up My Account</a></p><p>If you have any questions, don''t hesitate to reach out to us at (888) 570-4564 or reply to this email.</p><p>Welcome aboard!</p><p>The CRUMS Leasing Team</p>', 'welcome', true),
  ('Password Reminder', 'Don''t Forget to Set Up Your CRUMS Leasing Account', '<h1>Your CRUMS Leasing Account is Waiting!</h1><p>Hello {{customer_name}},</p><p>We noticed you haven''t set up your password yet. Setting up your account takes just a minute and gives you access to:</p><ul><li>View your rental agreements</li><li>Track toll charges</li><li>Manage your profile</li><li>Contact support directly</li></ul><p><a href="{{login_url}}">Set Up My Account Now</a></p><p>Need help? Call us at (888) 570-4564.</p><p>The CRUMS Leasing Team</p>', 'password_reminder', true),
  ('Profile Completion', 'Complete Your CRUMS Leasing Profile', '<h1>Almost There!</h1><p>Hello {{customer_name}},</p><p>Thanks for setting up your account! We noticed your profile isn''t complete yet. Completing your profile helps us serve you better.</p><p><a href="{{profile_url}}">Complete My Profile</a></p><p>The CRUMS Leasing Team</p>', 'profile_reminder', true),
  ('Re-engagement', 'We Miss You at CRUMS Leasing!', '<h1>It''s Been a While!</h1><p>Hello {{customer_name}},</p><p>We noticed it''s been some time since we last connected. At CRUMS Leasing, we''re always here to help with your trailer needs.</p><p>Whether you''re looking to lease again or just want to catch up, we''d love to hear from you!</p><p>Call us at (888) 570-4564 or reply to this email.</p><p>The CRUMS Leasing Team</p>', 'reengagement', true);