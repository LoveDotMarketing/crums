-- Fix privilege escalation: Only allow self-assignment of customer role
CREATE OR REPLACE FUNCTION public.set_user_role(_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow users to self-assign the customer role
  -- Admin and mechanic roles must be assigned by an existing admin
  IF _role != 'customer' THEN
    RAISE EXCEPTION 'Only customer role can be self-assigned. Contact an administrator for other roles.';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role);
END;
$$;