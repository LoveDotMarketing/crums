-- Create payment_failures table for tracking failed payments and dunning
CREATE TABLE public.payment_failures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_invoice_id TEXT,
  amount NUMERIC NOT NULL,
  failure_code TEXT,
  failure_message TEXT,
  failed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_type TEXT, -- 'paid', 'canceled', 'manually_resolved'
  notification_sent_day_0 BOOLEAN DEFAULT false,
  notification_sent_day_3 BOOLEAN DEFAULT false,
  notification_sent_day_5 BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add grace period columns to customer_subscriptions
ALTER TABLE public.customer_subscriptions
ADD COLUMN IF NOT EXISTS grace_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_payment_count INTEGER DEFAULT 0;

-- Create index for efficient queries
CREATE INDEX idx_payment_failures_subscription ON payment_failures(subscription_id);
CREATE INDEX idx_payment_failures_unresolved ON payment_failures(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_payment_failures_stripe_pi ON payment_failures(stripe_payment_intent_id);

-- Enable RLS
ALTER TABLE public.payment_failures ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only
CREATE POLICY "Admins can manage payment failures"
ON public.payment_failures
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_payment_failures_updated_at
BEFORE UPDATE ON public.payment_failures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();