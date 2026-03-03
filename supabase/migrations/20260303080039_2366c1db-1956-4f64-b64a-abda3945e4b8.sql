-- Add INSERT policy for stripe_webhook_logs (service role inserts via edge function)
CREATE POLICY "Service role can insert webhook logs"
ON public.stripe_webhook_logs
FOR INSERT
WITH CHECK (true);