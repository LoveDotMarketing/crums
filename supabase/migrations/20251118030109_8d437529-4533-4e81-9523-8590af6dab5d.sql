-- Add company_name to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Make banking and document fields nullable in customer_applications
ALTER TABLE customer_applications 
ALTER COLUMN bank_name DROP NOT NULL,
ALTER COLUMN account_holder_name DROP NOT NULL,
ALTER COLUMN account_number DROP NOT NULL,
ALTER COLUMN routing_number DROP NOT NULL,
ALTER COLUMN payment_method DROP NOT NULL,
ALTER COLUMN drivers_license_url DROP NOT NULL,
ALTER COLUMN ssn_card_url DROP NOT NULL,
ALTER COLUMN insurance_docs_url DROP NOT NULL,
ALTER COLUMN secondary_contact_name DROP NOT NULL,
ALTER COLUMN secondary_contact_phone DROP NOT NULL,
ALTER COLUMN secondary_contact_relationship DROP NOT NULL;