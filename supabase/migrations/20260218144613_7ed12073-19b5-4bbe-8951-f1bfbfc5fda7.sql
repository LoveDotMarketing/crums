
-- Add lease agreement URL to customer_subscriptions
ALTER TABLE public.customer_subscriptions
  ADD COLUMN IF NOT EXISTS lease_agreement_url text NULL;

COMMENT ON COLUMN public.customer_subscriptions.lease_agreement_url IS
  'Storage path for the signed lease-to-own agreement document';

-- Add storage policies for customer-documents bucket (drop first to avoid duplicates)
DROP POLICY IF EXISTS "Admins can upload customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Customers can read their lease agreements" ON storage.objects;

CREATE POLICY "Admins can upload customer documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update customer documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'customer-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Customers can read their lease agreements"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-documents'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'customer'::app_role)
  )
);
