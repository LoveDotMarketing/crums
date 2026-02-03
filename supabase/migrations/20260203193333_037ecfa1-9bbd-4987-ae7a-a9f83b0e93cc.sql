-- Create table for Stripe webhook event logs
CREATE TABLE public.stripe_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  customer_email TEXT,
  customer_id UUID,
  subscription_id UUID,
  stripe_subscription_id TEXT,
  amount NUMERIC,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key to customer_subscriptions (optional, may be null)
ALTER TABLE public.stripe_webhook_logs
ADD CONSTRAINT stripe_webhook_logs_subscription_id_fkey
FOREIGN KEY (subscription_id)
REFERENCES public.customer_subscriptions(id)
ON DELETE SET NULL;

-- Add foreign key to customers (optional, may be null)
ALTER TABLE public.stripe_webhook_logs
ADD CONSTRAINT stripe_webhook_logs_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES public.customers(id)
ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all logs
CREATE POLICY "Admins can read stripe webhook logs"
ON public.stripe_webhook_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create index for faster querying by event type and status
CREATE INDEX idx_stripe_webhook_logs_event_type ON public.stripe_webhook_logs(event_type);
CREATE INDEX idx_stripe_webhook_logs_status ON public.stripe_webhook_logs(status);
CREATE INDEX idx_stripe_webhook_logs_created_at ON public.stripe_webhook_logs(created_at DESC);