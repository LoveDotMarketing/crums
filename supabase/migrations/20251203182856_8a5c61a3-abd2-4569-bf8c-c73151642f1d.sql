-- Add unique constraint on email if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_email_unique'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_email_unique UNIQUE (email);
  END IF;
END $$;

-- Create function to generate account number
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate a unique account number using timestamp and random
  RETURN 'C' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 8));
END;
$$;

-- Create function to auto-create customer record when profile is created
CREATE OR REPLACE FUNCTION public.create_customer_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert customer record (only if email doesn't exist)
  INSERT INTO customers (
    email,
    full_name,
    company_name,
    phone,
    account_number,
    status
  ) VALUES (
    NEW.email,
    COALESCE(NEW.first_name || ' ' || NEW.last_name, 'Customer'),
    NEW.company_name,
    NEW.phone,
    generate_account_number(),
    'active'
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create customer on profile creation
DROP TRIGGER IF EXISTS on_profile_created_create_customer ON profiles;
CREATE TRIGGER on_profile_created_create_customer
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_customer_from_profile();

-- Backfill: Create customer records for existing profiles that don't have them
INSERT INTO customers (email, full_name, company_name, phone, account_number, status)
SELECT 
  p.email,
  COALESCE(p.first_name || ' ' || p.last_name, 'Customer'),
  p.company_name,
  p.phone,
  generate_account_number(),
  'active'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.email = p.email)
ON CONFLICT (email) DO NOTHING;