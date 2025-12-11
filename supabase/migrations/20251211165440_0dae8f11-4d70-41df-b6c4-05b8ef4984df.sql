-- Add SSN text column to customer_applications
ALTER TABLE public.customer_applications
ADD COLUMN ssn text;