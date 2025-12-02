-- Add payment_type column to customers table
ALTER TABLE public.customers 
ADD COLUMN payment_type text;