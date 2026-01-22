-- Create payment retry logs table for audit trail
CREATE TABLE public.payment_retry_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_failure_id UUID NOT NULL REFERENCES public.payment_failures(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  stripe_invoice_id TEXT,
  amount NUMERIC NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failed', 'already_paid', 'not_retryable')),
  error_message TEXT,
  customer_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_retry_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view all retry logs"
  ON public.payment_retry_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert retry logs"
  ON public.payment_retry_logs
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups by failure
CREATE INDEX idx_payment_retry_logs_failure_id ON public.payment_retry_logs(payment_failure_id);
CREATE INDEX idx_payment_retry_logs_created_at ON public.payment_retry_logs(created_at DESC);