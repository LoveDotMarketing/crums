-- Add lease to own columns to subscription_items table
ALTER TABLE public.subscription_items
ADD COLUMN lease_to_own BOOLEAN DEFAULT false,
ADD COLUMN ownership_transfer_date DATE NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.subscription_items.lease_to_own IS 'Indicates if this trailer lease is a lease-to-own agreement';
COMMENT ON COLUMN public.subscription_items.ownership_transfer_date IS 'Date when ownership transfers to customer for lease-to-own agreements';