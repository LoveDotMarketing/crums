-- Add per-trailer billing fields to subscription_items
ALTER TABLE public.subscription_items
  ADD COLUMN IF NOT EXISTS billing_cycle text NULL,
  ADD COLUMN IF NOT EXISTS billing_anchor_day integer NULL;

COMMENT ON COLUMN public.subscription_items.billing_cycle IS 
  'Per-trailer billing cycle override. NULL = inherit from parent subscription. Values: weekly, biweekly, semimonthly, monthly';
COMMENT ON COLUMN public.subscription_items.billing_anchor_day IS 
  'Anchor day: 1 or 15 for monthly, 5 (Friday) for weekly. NULL = inherit from parent subscription.';

-- Add preferred_billing_cycle to customer_applications
ALTER TABLE public.customer_applications
  ADD COLUMN IF NOT EXISTS preferred_billing_cycle text NULL;

COMMENT ON COLUMN public.customer_applications.preferred_billing_cycle IS 
  'weekly, semimonthly, monthly — customer billing cycle preference captured during application';