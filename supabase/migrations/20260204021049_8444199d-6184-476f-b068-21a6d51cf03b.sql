-- Create scheduled_content table for tracking auto-publish schedule
CREATE TABLE public.scheduled_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('guide', 'tool', 'news')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(content_type, slug)
);

-- Enable RLS
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view scheduled content"
  ON public.scheduled_content
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert scheduled content"
  ON public.scheduled_content
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scheduled content"
  ON public.scheduled_content
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scheduled content"
  ON public.scheduled_content
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_scheduled_content_updated_at
  BEFORE UPDATE ON public.scheduled_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient queries
CREATE INDEX idx_scheduled_content_date ON public.scheduled_content(scheduled_date);
CREATE INDEX idx_scheduled_content_status ON public.scheduled_content(status);