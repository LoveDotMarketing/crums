
-- 1. Fix the create_customer_from_profile trigger to handle NULL names
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
    NEW.email,
    v_full_name,
    NEW.company_name,
    NEW.phone,
    generate_account_number(),
    'active'
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- 2. Create a sync function that updates customers when profiles are updated
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
  
  -- Only update if we have a real name now
  IF v_full_name != '' THEN
    UPDATE customers
    SET 
      full_name = v_full_name,
      phone = COALESCE(NEW.phone, customers.phone),
      company_name = COALESCE(NEW.company_name, customers.company_name),
      updated_at = now()
    WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Create the trigger on profiles for UPDATE
CREATE TRIGGER sync_profile_to_customer_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name OR
    OLD.phone IS DISTINCT FROM NEW.phone OR
    OLD.company_name IS DISTINCT FROM NEW.company_name
  )
  EXECUTE FUNCTION public.sync_profile_to_customer();

-- 4. Backfill existing "Customer" records from profiles
UPDATE customers c
SET 
  full_name = TRIM(CONCAT_WS(' ', p.first_name, p.last_name)),
  phone = COALESCE(p.phone, c.phone),
  company_name = COALESCE(p.company_name, c.company_name),
  updated_at = now()
FROM profiles p
WHERE p.email = c.email
  AND c.full_name = 'Customer'
  AND TRIM(CONCAT_WS(' ', p.first_name, p.last_name)) != '';
