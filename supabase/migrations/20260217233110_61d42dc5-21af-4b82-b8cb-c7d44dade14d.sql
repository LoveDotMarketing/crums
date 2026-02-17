
-- Drop the existing case-sensitive unique constraint on email
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_email_key;

-- Create a case-insensitive unique index instead
CREATE UNIQUE INDEX customers_email_unique_ci ON public.customers (lower(email));

-- Update the trigger to normalize email to lowercase on insert
CREATE OR REPLACE FUNCTION public.create_customer_from_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name text;
BEGIN
  v_full_name := TRIM(CONCAT_WS(' ', NEW.first_name, NEW.last_name));
  IF v_full_name = '' THEN
    v_full_name := 'Customer';
  END IF;

  INSERT INTO customers (
    email,
    full_name,
    company_name,
    phone,
    account_number,
    status
  ) VALUES (
    lower(NEW.email),
    v_full_name,
    NEW.company_name,
    NEW.phone,
    generate_account_number(),
    'active'
  )
  ON CONFLICT (lower(email)) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Also update sync trigger to use case-insensitive matching
CREATE OR REPLACE FUNCTION public.sync_profile_to_customer()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name text;
BEGIN
  v_full_name := TRIM(CONCAT_WS(' ', NEW.first_name, NEW.last_name));
  
  IF v_full_name != '' THEN
    UPDATE customers
    SET 
      full_name = v_full_name,
      phone = COALESCE(NEW.phone, customers.phone),
      company_name = COALESCE(NEW.company_name, customers.company_name),
      updated_at = now()
    WHERE lower(email) = lower(NEW.email);
  END IF;
  
  RETURN NEW;
END;
$function$;
