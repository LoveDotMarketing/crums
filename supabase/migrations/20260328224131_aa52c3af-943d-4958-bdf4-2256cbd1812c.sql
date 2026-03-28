-- Drop the FK to profiles since customer_id now references customers table
ALTER TABLE public.tolls DROP CONSTRAINT IF EXISTS tolls_customer_id_fkey;

-- Migrate existing toll customer_ids from profile IDs to customer IDs
UPDATE public.tolls t
SET customer_id = c.id
FROM public.profiles p
JOIN public.customers c ON lower(c.email) = lower(p.email)
WHERE t.customer_id = p.id
AND c.id IS NOT NULL;