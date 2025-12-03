-- Create redirects table for managing 404 URL redirects
CREATE TABLE public.redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Public can read active redirects (needed for redirect lookup on NotFound page)
CREATE POLICY "Anyone can view active redirects"
ON public.redirects
FOR SELECT
USING (is_active = true);

-- Admins can view all redirects
CREATE POLICY "Admins can view all redirects"
ON public.redirects
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert redirects
CREATE POLICY "Admins can insert redirects"
ON public.redirects
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update redirects
CREATE POLICY "Admins can update redirects"
ON public.redirects
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete redirects
CREATE POLICY "Admins can delete redirects"
ON public.redirects
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_redirects_updated_at
BEFORE UPDATE ON public.redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();