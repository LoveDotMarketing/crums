-- Create immutable audit log for sandbox toggles
CREATE TABLE public.subscription_sandbox_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.customer_subscriptions(id) ON DELETE CASCADE,
  from_sandbox boolean NOT NULL,
  to_sandbox boolean NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  reason text
);

-- Indexes for common access patterns
CREATE INDEX idx_sandbox_audit_subscription
  ON public.subscription_sandbox_audit (subscription_id, changed_at DESC);

CREATE INDEX idx_sandbox_audit_recent
  ON public.subscription_sandbox_audit (changed_at DESC);

-- Enable RLS
ALTER TABLE public.subscription_sandbox_audit ENABLE ROW LEVEL SECURITY;

-- Admins can read the audit log
CREATE POLICY "Admins can view sandbox audit"
  ON public.subscription_sandbox_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert audit rows (edge functions use service role; this is a safety net)
CREATE POLICY "Admins can insert sandbox audit"
  ON public.subscription_sandbox_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Intentionally no UPDATE or DELETE policies — audit log is immutable.