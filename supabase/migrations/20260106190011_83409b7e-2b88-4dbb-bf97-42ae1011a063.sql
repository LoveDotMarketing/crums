-- Fix contact_submissions table: Remove overly permissive SELECT policy
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- Only admins should be able to view submissions via the admin panel

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can view submissions" ON public.contact_submissions;

-- Note: "Admins can view all submissions" policy already exists and is properly scoped