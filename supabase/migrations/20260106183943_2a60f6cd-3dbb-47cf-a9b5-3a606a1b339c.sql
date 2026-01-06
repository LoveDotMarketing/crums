-- Drop overly permissive public policies on login_attempts table
-- The admin policies already exist, so we just need to remove the public ones
DROP POLICY IF EXISTS "Anyone can check login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Anyone can update login attempts" ON public.login_attempts;