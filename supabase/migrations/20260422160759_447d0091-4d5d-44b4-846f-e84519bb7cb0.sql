ALTER TABLE public.customer_subscriptions
  ADD COLUMN IF NOT EXISTS sandbox boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sandbox_stripe_customer_id text NULL;

CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_sandbox
  ON public.customer_subscriptions(sandbox)
  WHERE sandbox = true;

ALTER TABLE public.billing_history
  ADD COLUMN IF NOT EXISTS stripe_mode text NOT NULL DEFAULT 'live';

ALTER TABLE public.billing_history
  DROP CONSTRAINT IF EXISTS billing_history_stripe_mode_check;

ALTER TABLE public.billing_history
  ADD CONSTRAINT billing_history_stripe_mode_check
  CHECK (stripe_mode IN ('live', 'test'));