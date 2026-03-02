
-- Add customer_id column to customer_applications
ALTER TABLE public.customer_applications
ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Make user_id nullable
ALTER TABLE public.customer_applications
ALTER COLUMN user_id DROP NOT NULL;

-- Create unique index on customer_id (when not null)
CREATE UNIQUE INDEX idx_customer_applications_customer_id
ON public.customer_applications (customer_id)
WHERE customer_id IS NOT NULL;
