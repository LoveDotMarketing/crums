-- Add end_date column to customer_subscriptions for lease term end dates
ALTER TABLE public.customer_subscriptions 
ADD COLUMN IF NOT EXISTS end_date date DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.customer_subscriptions.end_date IS 'Optional end date for fixed-term lease agreements';