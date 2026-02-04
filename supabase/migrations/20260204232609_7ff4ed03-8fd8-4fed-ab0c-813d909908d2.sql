-- Add subscription_type enum
CREATE TYPE subscription_type AS ENUM (
  'standard_lease',
  'rent_for_storage', 
  'lease_to_own',
  'repayment_plan'
);

-- Add column to customer_subscriptions with default value
ALTER TABLE customer_subscriptions 
ADD COLUMN subscription_type subscription_type DEFAULT 'standard_lease';