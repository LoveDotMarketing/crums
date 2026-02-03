-- Drop and recreate the outreach_logs foreign key with ON DELETE SET NULL
ALTER TABLE public.outreach_logs 
DROP CONSTRAINT IF EXISTS outreach_logs_customer_id_fkey;

ALTER TABLE public.outreach_logs 
ADD CONSTRAINT outreach_logs_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;