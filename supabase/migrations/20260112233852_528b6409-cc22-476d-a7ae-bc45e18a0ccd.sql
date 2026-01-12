-- Fix: Remove public access to redirects table
-- The 'Anyone can view active redirects' policy exposes internal URL structure

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view active redirects" ON public.redirects;