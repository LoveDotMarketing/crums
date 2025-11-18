-- Create a customer-safe view that masks sensitive PII
CREATE VIEW public.customer_application_safe AS
SELECT 
  id, 
  user_id, 
  status, 
  phone_number, 
  mc_dot_number, 
  company_address, 
  business_type,
  number_of_trailers, 
  date_needed, 
  message,
  secondary_contact_name, 
  secondary_contact_phone,
  secondary_contact_relationship,
  insurance_company,
  payment_method,
  -- Indicate document presence without exposing URLs
  (ssn_card_url IS NOT NULL) as has_ssn_card,
  (drivers_license_url IS NOT NULL) as has_drivers_license,
  (insurance_docs_url IS NOT NULL) as has_insurance_docs,
  (contract_url IS NOT NULL) as has_contract,
  -- Mask bank account details (show last 4 digits only)
  bank_name,
  CASE 
    WHEN account_number IS NOT NULL THEN CONCAT('****', RIGHT(account_number, 4))
    ELSE NULL
  END as account_number_masked,
  CASE 
    WHEN routing_number IS NOT NULL THEN CONCAT('****', RIGHT(routing_number, 4))
    ELSE NULL
  END as routing_number_masked,
  CASE 
    WHEN account_holder_name IS NOT NULL THEN account_holder_name
    ELSE NULL
  END as account_holder_name,
  company_id,
  primary_trailer_id,
  backup_trailer_id,
  rental_start_date,
  admin_notes,
  reviewed_by,
  reviewed_at,
  created_at, 
  updated_at
FROM public.customer_applications;

-- Enable RLS on the view
ALTER VIEW public.customer_application_safe SET (security_invoker = true);

-- Drop the existing customer SELECT policy
DROP POLICY IF EXISTS "Users can view their own application" ON public.customer_applications;

-- Create new admin-only policy for full sensitive data access
CREATE POLICY "Admins can view all sensitive data"
ON public.customer_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Keep the insert and update policies for customers
-- (Insert policy already exists: "Users can insert their own application")
-- (Update policy already exists: "Users can update their own pending application")