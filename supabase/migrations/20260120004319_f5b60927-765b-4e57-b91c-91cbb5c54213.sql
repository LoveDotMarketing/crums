-- Fix customer_application_safe view to use security_invoker
-- This ensures RLS policies from the base table are enforced when querying the view

ALTER VIEW public.customer_application_safe SET (security_invoker = on);