
-- Fix RLS policies to use case-insensitive email matching

-- 1. customer_subscriptions: "Customers can view their own subscriptions"
DROP POLICY IF EXISTS "Customers can view their own subscriptions" ON public.customer_subscriptions;
CREATE POLICY "Customers can view their own subscriptions"
  ON public.customer_subscriptions
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND customer_id IN (
      SELECT c.id
      FROM customers c
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );

-- 2. billing_history: "Customers can view their billing history"
DROP POLICY IF EXISTS "Customers can view their billing history" ON public.billing_history;
CREATE POLICY "Customers can view their billing history"
  ON public.billing_history
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND subscription_id IN (
      SELECT cs.id
      FROM customer_subscriptions cs
      JOIN customers c ON c.id = cs.customer_id
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );

-- 3. trailers: "Customers can view assigned trailers"
DROP POLICY IF EXISTS "Customers can view assigned trailers" ON public.trailers;
CREATE POLICY "Customers can view assigned trailers"
  ON public.trailers
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND (
      customer_id IN (
        SELECT c.id
        FROM customers c
        JOIN profiles p ON lower(p.email) = lower(c.email)
        WHERE p.id = auth.uid()
      )
      OR assigned_to = auth.uid()
    )
  );

-- 4. trailer_checkout_agreements: "Customers can view their own checkout agreements"
DROP POLICY IF EXISTS "Customers can view their own checkout agreements" ON public.trailer_checkout_agreements;
CREATE POLICY "Customers can view their own checkout agreements"
  ON public.trailer_checkout_agreements
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND customer_id IN (
      SELECT c.id
      FROM customers c
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );

-- 5. trailer_checkout_agreements: "Customers can sign their own agreements"
DROP POLICY IF EXISTS "Customers can sign their own agreements" ON public.trailer_checkout_agreements;
CREATE POLICY "Customers can sign their own agreements"
  ON public.trailer_checkout_agreements
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND customer_id IN (
      SELECT c.id
      FROM customers c
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );

-- 6. dot_inspections: "Customers can view their trailer inspections"
DROP POLICY IF EXISTS "Customers can view their trailer inspections" ON public.dot_inspections;
CREATE POLICY "Customers can view their trailer inspections"
  ON public.dot_inspections
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND trailer_id IN (
      SELECT t.id
      FROM trailers t
      JOIN customers c ON t.customer_id = c.id
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );

-- 7. dot_inspections: "Customers can sign off on inspections"
DROP POLICY IF EXISTS "Customers can sign off on inspections" ON public.dot_inspections;
CREATE POLICY "Customers can sign off on inspections"
  ON public.dot_inspections
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND status = 'completed'
    AND customer_acknowledged = false
    AND trailer_id IN (
      SELECT t.id
      FROM trailers t
      JOIN customers c ON t.customer_id = c.id
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (has_role(auth.uid(), 'customer'::app_role));

-- 8. referrals: "Customers can view their referrals"
DROP POLICY IF EXISTS "Customers can view their referrals" ON public.referrals;
CREATE POLICY "Customers can view their referrals"
  ON public.referrals
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer'::app_role)
    AND referrer_code_id IN (
      SELECT rc.id
      FROM referral_codes rc
      JOIN customers c ON c.id = rc.customer_id
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );
