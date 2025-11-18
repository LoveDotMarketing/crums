-- Create a secure function to set user role after signup
CREATE OR REPLACE FUNCTION public.set_user_role(_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role);
END;
$$;

-- Add INSERT policy for profiles to allow the handle_new_user trigger to work
CREATE POLICY "Allow profile creation via trigger"
ON public.profiles
FOR INSERT
WITH CHECK (true);