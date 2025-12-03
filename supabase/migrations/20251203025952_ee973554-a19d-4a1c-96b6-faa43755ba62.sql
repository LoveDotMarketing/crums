-- Add automation_enabled setting (master switch) defaulting to false
INSERT INTO outreach_settings (setting_key, setting_value, description)
VALUES ('automation_enabled', 'false', 'Master switch for all automated outreach emails. When off, no automated emails are sent.')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'false';

-- Ensure all other settings exist with defaults
INSERT INTO outreach_settings (setting_key, setting_value, description)
VALUES 
  ('welcome_email_enabled', 'true', 'Enable automatic welcome emails'),
  ('password_reminder_enabled', 'true', 'Enable password setup reminders'),
  ('password_reminder_days', '3', 'Days between password reminders'),
  ('profile_reminder_enabled', 'true', 'Enable profile completion reminders'),
  ('profile_reminder_days', '3', 'Days between profile reminders'),
  ('from_name', 'CRUMS Leasing', 'Default sender name'),
  ('from_email', 'sales@crumsleasing.com', 'Default sender email'),
  ('reply_to', 'sales@crumsleasing.com', 'Default reply-to email'),
  ('max_reminders', '5', 'Maximum number of reminders per customer')
ON CONFLICT (setting_key) DO NOTHING;

-- Create default email templates for automation
INSERT INTO email_templates (name, subject, body, template_type, is_active)
VALUES 
  ('Welcome Email', 'Welcome to CRUMS Leasing - Set Up Your Account', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0EA5E9;">Welcome to CRUMS Leasing!</h1>
  <p>Dear {{customer_name}},</p>
  <p>Thank you for being a valued CRUMS Leasing customer. We''ve upgraded our systems to serve you better!</p>
  <p>To access your new customer portal, please set up your password by clicking the button below:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{login_url}}" style="background-color: #0EA5E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up Your Account</a>
  </p>
  <p>Your customer portal gives you access to:</p>
  <ul>
    <li>View your rental agreements</li>
    <li>Track tolls and payments</li>
    <li>Submit support requests</li>
    <li>Update your profile information</li>
  </ul>
  <p>If you have any questions, please don''t hesitate to contact us at (888) 570-4564.</p>
  <p>Best regards,<br>The CRUMS Leasing Team</p>
</div>', 'welcome', true),
  
  ('Password Reminder', 'Complete Your CRUMS Leasing Account Setup', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0EA5E9;">Don''t Forget to Set Up Your Account!</h1>
  <p>Dear {{customer_name}},</p>
  <p>We noticed you haven''t completed setting up your CRUMS Leasing customer portal account yet.</p>
  <p>Setting up your account only takes a minute and gives you access to:</p>
  <ul>
    <li>View your rental agreements</li>
    <li>Track tolls and payments</li>
    <li>Submit support requests</li>
  </ul>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{login_url}}" style="background-color: #0EA5E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up Your Account Now</a>
  </p>
  <p>Need help? Contact us at (888) 570-4564.</p>
  <p>Best regards,<br>The CRUMS Leasing Team</p>
</div>', 'password_reminder', true),

  ('Profile Completion Reminder', 'Complete Your CRUMS Leasing Profile', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0EA5E9;">Complete Your Profile</h1>
  <p>Dear {{customer_name}},</p>
  <p>Your CRUMS Leasing account is set up, but your profile is incomplete. A complete profile helps us serve you better!</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{profile_url}}" style="background-color: #0EA5E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Your Profile</a>
  </p>
  <p>Questions? Call us at (888) 570-4564.</p>
  <p>Best regards,<br>The CRUMS Leasing Team</p>
</div>', 'profile_reminder', true)
ON CONFLICT DO NOTHING;