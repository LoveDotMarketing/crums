-- Add 'suspended' to customer_subscriptions status constraint
ALTER TABLE customer_subscriptions 
DROP CONSTRAINT IF EXISTS customer_subscriptions_status_check;

ALTER TABLE customer_subscriptions 
ADD CONSTRAINT customer_subscriptions_status_check 
CHECK (status IN ('pending', 'active', 'paused', 'suspended', 'canceled'));