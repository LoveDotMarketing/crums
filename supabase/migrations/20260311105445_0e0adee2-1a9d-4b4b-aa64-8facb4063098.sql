
-- Step 1: Convert ALL restrictive RLS policies to permissive
DO $$
DECLARE
  pol RECORD;
  create_sql TEXT;
  roles_str TEXT;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND permissive = 'RESTRICTIVE'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

    roles_str := array_to_string(pol.roles, ', ');

    create_sql := format('CREATE POLICY %I ON %I.%I AS PERMISSIVE FOR %s TO %s',
      pol.policyname, pol.schemaname, pol.tablename, pol.cmd, roles_str);

    IF pol.qual IS NOT NULL THEN
      create_sql := create_sql || ' USING (' || pol.qual || ')';
    END IF;

    IF pol.with_check IS NOT NULL THEN
      create_sql := create_sql || ' WITH CHECK (' || pol.with_check || ')';
    END IF;

    EXECUTE create_sql;
  END LOOP;
END $$;

-- Step 2: Fix broken toll customer policies
-- Drop the broken policies
DROP POLICY IF EXISTS "Customers can view their tolls" ON public.tolls;
DROP POLICY IF EXISTS "Customers can update their toll status" ON public.tolls;

-- Recreate with correct join logic (matching pattern used by other customer-facing policies)
CREATE POLICY "Customers can view their tolls" ON public.tolls
  AS PERMISSIVE FOR SELECT TO public
  USING (
    has_role(auth.uid(), 'customer'::app_role) AND
    customer_id IN (
      SELECT c.id FROM customers c
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their toll status" ON public.tolls
  AS PERMISSIVE FOR UPDATE TO public
  USING (
    has_role(auth.uid(), 'customer'::app_role) AND
    customer_id IN (
      SELECT c.id FROM customers c
      JOIN profiles p ON lower(p.email) = lower(c.email)
      WHERE p.id = auth.uid()
    )
  );
