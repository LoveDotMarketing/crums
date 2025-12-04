-- Fix: Update toll-receipts storage policy to use folder-based isolation
-- Drop the overly permissive customer policy
DROP POLICY IF EXISTS "Customers can view their toll receipts" ON storage.objects;

-- Create new policy with folder-based isolation (customers can only view their own receipts)
CREATE POLICY "Customers can view their own toll receipts"
ON storage.objects
FOR SELECT
USING (
  (bucket_id = 'toll-receipts'::text) 
  AND has_role(auth.uid(), 'customer'::app_role) 
  AND ((auth.uid())::text = (storage.foldername(name))[1])
);

-- Also add customer upload policy with folder isolation (if they need to upload)
CREATE POLICY "Customers can upload their own toll receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  (bucket_id = 'toll-receipts'::text) 
  AND has_role(auth.uid(), 'customer'::app_role) 
  AND ((auth.uid())::text = (storage.foldername(name))[1])
);