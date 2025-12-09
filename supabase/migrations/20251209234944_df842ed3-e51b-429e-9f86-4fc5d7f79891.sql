-- Add new columns to profiles table for Basic Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_address TEXT;

-- Add new columns to customer_applications table
-- Drivers Compliance
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS business_needs TEXT;
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS truck_vin TEXT;
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS trailer_type TEXT;

-- Payment
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS consent_autopay BOOLEAN DEFAULT FALSE;
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS prepay_full_year BOOLEAN DEFAULT FALSE;

-- Agreements
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS consent_communications BOOLEAN DEFAULT FALSE;
ALTER TABLE customer_applications ADD COLUMN IF NOT EXISTS consent_credit_check BOOLEAN DEFAULT FALSE;

-- Update the customer_application_safe view to include new non-sensitive fields
DROP VIEW IF EXISTS customer_application_safe;
CREATE VIEW customer_application_safe AS
SELECT 
    id,
    user_id,
    number_of_trailers,
    date_needed,
    company_id,
    primary_trailer_id,
    backup_trailer_id,
    rental_start_date,
    reviewed_by,
    reviewed_at,
    created_at,
    updated_at,
    status,
    phone_number,
    mc_dot_number,
    company_address,
    business_type,
    message,
    secondary_contact_name,
    secondary_contact_phone,
    secondary_contact_relationship,
    insurance_company,
    payment_method,
    bank_name,
    -- Mask sensitive banking info
    CASE 
        WHEN account_number IS NOT NULL 
        THEN '****' || RIGHT(account_number, 4)
        ELSE NULL 
    END as account_number_masked,
    CASE 
        WHEN routing_number IS NOT NULL 
        THEN '****' || RIGHT(routing_number, 4)
        ELSE NULL 
    END as routing_number_masked,
    account_holder_name,
    admin_notes,
    -- New fields
    business_needs,
    truck_vin,
    trailer_type,
    billing_address,
    consent_autopay,
    prepay_full_year,
    terms_accepted,
    terms_accepted_at,
    consent_communications,
    consent_credit_check,
    -- Document status flags (not URLs)
    CASE WHEN ssn_card_url IS NOT NULL THEN TRUE ELSE FALSE END as has_ssn_card,
    CASE WHEN drivers_license_url IS NOT NULL THEN TRUE ELSE FALSE END as has_drivers_license,
    CASE WHEN insurance_docs_url IS NOT NULL THEN TRUE ELSE FALSE END as has_insurance_docs,
    CASE WHEN contract_url IS NOT NULL THEN TRUE ELSE FALSE END as has_contract
FROM customer_applications;