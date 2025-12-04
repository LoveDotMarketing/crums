-- Remove the overly permissive SELECT policy that allows any authenticated user to read contact submissions
DROP POLICY IF EXISTS "Service role can view submissions" ON public.contact_submissions;