-- Drop the overly permissive policy that allows anyone to see all active referral codes
DROP POLICY IF EXISTS "Anyone can check referral code validity" ON public.referral_codes;