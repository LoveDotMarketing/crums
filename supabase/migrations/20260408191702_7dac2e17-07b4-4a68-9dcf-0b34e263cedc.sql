-- 1. Fix profiles INSERT policy: restrict to auth.uid() = id
DROP POLICY IF EXISTS "Allow profile creation via trigger" ON public.profiles;
CREATE POLICY "Allow profile creation via trigger"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Remove user_activity_logs from Realtime publication to stop broadcasting sensitive data
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_activity_logs;

-- 3. Add customer DELETE policy for customer-documents storage bucket
CREATE POLICY "Customers can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'customer-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );