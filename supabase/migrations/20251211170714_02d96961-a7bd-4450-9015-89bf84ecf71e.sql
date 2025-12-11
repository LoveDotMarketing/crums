-- Add insurance company phone number column to customer_applications
ALTER TABLE public.customer_applications
ADD COLUMN insurance_company_phone text;