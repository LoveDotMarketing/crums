-- Drop the overly broad policy that allows any customer to read all documents
DROP POLICY IF EXISTS "Customers can read their lease agreements" ON storage.objects;