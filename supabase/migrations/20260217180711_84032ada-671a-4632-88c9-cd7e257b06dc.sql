
-- Add lease_to_own_total to track total buyout price for lease-to-own agreements
ALTER TABLE public.subscription_items 
ADD COLUMN IF NOT EXISTS lease_to_own_total numeric NULL;

-- Add a comment for clarity
COMMENT ON COLUMN public.subscription_items.lease_to_own_total IS 'Total price for lease-to-own agreements. When fully paid, ownership transfers.';
