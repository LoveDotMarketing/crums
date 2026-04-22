-- Extend customer_subscriptions for sandbox mode
ALTER TABLE customer_subscriptions
  ADD COLUMN IF NOT EXISTS sandbox_stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES customer_applications(id);

-- Backfill the orphaned sandbox subscription row
UPDATE customer_subscriptions
SET sandbox = true,
    sandbox_stripe_customer_id = stripe_customer_id,
    sandbox_stripe_subscription_id = stripe_subscription_id,
    stripe_customer_id = NULL,
    stripe_subscription_id = NULL
WHERE id = '7b024be1-416e-4103-ba00-a844f3e4daaa'
  AND stripe_customer_id IS NOT NULL;

-- Mark the deposit invoice as succeeded (Stripe shows it paid)
UPDATE billing_history
SET status = 'succeeded',
    paid_at = COALESCE(paid_at, now()),
    stripe_mode = 'test'
WHERE stripe_invoice_id = 'in_1TP50oPtmYCiZhW2VI1ceBgQ';

UPDATE customer_subscriptions
SET deposit_paid = true,
    deposit_paid_at = COALESCE(deposit_paid_at, now())
WHERE id = '7b024be1-416e-4103-ba00-a844f3e4daaa';