-- Add last_retry_at column to track when the last manual retry was attempted
ALTER TABLE public.payment_failures
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE;