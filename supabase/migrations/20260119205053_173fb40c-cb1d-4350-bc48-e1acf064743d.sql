-- First, drop the old check constraint
ALTER TABLE public.customer_applications 
DROP CONSTRAINT IF EXISTS customer_applications_status_check;

-- Update any existing 'pending' records to 'pending_review' BEFORE adding constraint
UPDATE public.customer_applications 
SET status = 'pending_review' 
WHERE status = 'pending';

-- Now add the updated check constraint with pending_review
ALTER TABLE public.customer_applications 
ADD CONSTRAINT customer_applications_status_check 
CHECK (status = ANY (ARRAY['new'::text, 'pending_review'::text, 'approved'::text, 'rejected'::text]));