-- Drop the view first, then remove unused columns, then recreate view

-- Step 1: Drop the dependent view
DROP VIEW IF EXISTS public.customer_application_safe;

-- Step 2: Remove unused columns from customer_applications
ALTER TABLE public.customer_applications
DROP COLUMN IF EXISTS mc_number,
DROP COLUMN IF EXISTS mc_dot_number,
DROP COLUMN IF EXISTS business_needs,
DROP COLUMN IF EXISTS billing_address,
DROP COLUMN IF EXISTS bank_name,
DROP COLUMN IF EXISTS account_holder_name,
DROP COLUMN IF EXISTS routing_number,
DROP COLUMN IF EXISTS account_number,
DROP COLUMN IF EXISTS payment_method,
DROP COLUMN IF EXISTS ssn_card_url,
DROP COLUMN IF EXISTS contract_url,
DROP COLUMN IF EXISTS company_id,
DROP COLUMN IF EXISTS primary_trailer_id,
DROP COLUMN IF EXISTS backup_trailer_id,
DROP COLUMN IF EXISTS rental_start_date,
DROP COLUMN IF EXISTS consent_autopay,
DROP COLUMN IF EXISTS prepay_full_year,
DROP COLUMN IF EXISTS terms_accepted,
DROP COLUMN IF EXISTS terms_accepted_at,
DROP COLUMN IF EXISTS consent_communications,
DROP COLUMN IF EXISTS consent_credit_check;

-- Step 3: Recreate the view with remaining columns (masking sensitive data)
CREATE VIEW public.customer_application_safe AS
SELECT 
  id,
  user_id,
  status,
  admin_notes,
  phone_number,
  company_address,
  business_type,
  insurance_company,
  insurance_company_phone,
  message,
  truck_vin,
  trailer_type,
  number_of_trailers,
  date_needed,
  -- Document presence flags (not URLs)
  dot_number_url IS NOT NULL AS has_dot_document,
  drivers_license_url IS NOT NULL AS has_drivers_license,
  drivers_license_back_url IS NOT NULL AS has_drivers_license_back,
  insurance_docs_url IS NOT NULL AS has_insurance_docs,
  -- Masked SSN
  CASE WHEN ssn IS NOT NULL THEN 'XXX-XX-' || RIGHT(ssn, 4) ELSE NULL END AS ssn_masked,
  -- Secondary contact
  secondary_contact_name,
  secondary_contact_phone,
  secondary_contact_relationship,
  -- Timestamps
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
FROM public.customer_applications;