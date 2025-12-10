-- Drop overly permissive policies that allow direct API manipulation
DROP POLICY IF EXISTS "Anyone can check login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Anyone can update login attempts" ON login_attempts;

-- Add admin-only policies for security monitoring and cleanup
CREATE POLICY "Admins can view login attempts"
ON login_attempts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete login attempts"
ON login_attempts FOR DELETE
USING (has_role(auth.uid(), 'admin'));