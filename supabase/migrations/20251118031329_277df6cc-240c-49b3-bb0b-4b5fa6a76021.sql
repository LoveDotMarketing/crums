-- Add new fields to customer_applications table for leasing agreement
ALTER TABLE customer_applications 
ADD COLUMN IF NOT EXISTS mc_dot_number TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS number_of_trailers INTEGER,
ADD COLUMN IF NOT EXISTS date_needed DATE,
ADD COLUMN IF NOT EXISTS insurance_company TEXT,
ADD COLUMN IF NOT EXISTS message TEXT;