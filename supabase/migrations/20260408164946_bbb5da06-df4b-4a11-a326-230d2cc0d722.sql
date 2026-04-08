-- Add 'sales' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales';

-- Permissions table
CREATE TABLE public.staff_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_key)
);

ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage permissions
CREATE POLICY "Admins can manage staff permissions"
  ON public.staff_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Staff can read their own permissions
CREATE POLICY "Staff can view own permissions"
  ON public.staff_permissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);