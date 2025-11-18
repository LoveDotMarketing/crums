-- Update RLS policies to allow customers to view all trailers
-- Drop the existing policy that restricts customers to only assigned trailers
DROP POLICY IF EXISTS "Customers can view their assigned trailers" ON trailers;

-- Create new policy allowing customers to view all trailers
CREATE POLICY "Customers can view all trailers" 
ON trailers 
FOR SELECT 
TO public
USING (has_role(auth.uid(), 'customer'::app_role));

-- Ensure realtime is enabled for trailers table
ALTER TABLE trailers REPLICA IDENTITY FULL;

-- Add trailers table to realtime publication if not already added
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE trailers;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;