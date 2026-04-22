-- Add sandbox columns to customer_applications
ALTER TABLE public.customer_applications
  ADD COLUMN IF NOT EXISTS sandbox boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_mode text NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS sandbox_stripe_customer_id text NULL;

-- Extend subscription_sandbox_audit to also log application toggles
ALTER TABLE public.subscription_sandbox_audit
  ADD COLUMN IF NOT EXISTS application_id uuid NULL REFERENCES public.customer_applications(id) ON DELETE SET NULL,
  ALTER COLUMN subscription_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sandbox_audit_application
  ON public.subscription_sandbox_audit (application_id, changed_at DESC)
  WHERE application_id IS NOT NULL;