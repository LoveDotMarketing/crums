-- Create development_changelog table for tracking project development activity
CREATE TABLE public.development_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('news', 'guide', 'tool', 'location', 'team', 'admin_feature', 'edge_function', 'database_table')),
  item_name TEXT NOT NULL,
  item_slug TEXT NOT NULL,
  item_url TEXT,
  action TEXT NOT NULL CHECK (action IN ('added', 'updated', 'removed')),
  date_recorded DATE NOT NULL,
  month_year TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_development_changelog_month_year ON public.development_changelog(month_year);
CREATE INDEX idx_development_changelog_category ON public.development_changelog(category);
CREATE INDEX idx_development_changelog_date ON public.development_changelog(date_recorded DESC);
CREATE INDEX idx_development_changelog_item_slug ON public.development_changelog(item_slug);

-- Enable Row Level Security
ALTER TABLE public.development_changelog ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin read access
CREATE POLICY "Admins can view development changelog"
ON public.development_changelog
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create RLS policy for admin insert access (for edge function with service role)
CREATE POLICY "Service role can insert changelog entries"
ON public.development_changelog
FOR INSERT
WITH CHECK (true);

-- Create RLS policy for admin update access
CREATE POLICY "Admins can update development changelog"
ON public.development_changelog
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create RLS policy for admin delete access
CREATE POLICY "Admins can delete development changelog"
ON public.development_changelog
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);