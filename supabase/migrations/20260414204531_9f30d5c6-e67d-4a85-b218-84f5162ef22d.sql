-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert webhook logs" ON public.stripe_webhook_logs;

-- Recreate with restriction: only authenticated users can insert (service role bypasses RLS anyway)
-- Using a false condition ensures no client-side role can insert; only service role (which bypasses RLS) can.
CREATE POLICY "No client inserts on webhook logs"
ON public.stripe_webhook_logs
FOR INSERT
TO authenticated
WITH CHECK (false);