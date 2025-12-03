-- Create contact_submissions table for rate limiting and spam tracking
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  email TEXT,
  is_spam BOOLEAN DEFAULT false,
  spam_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow insert from edge functions (service role)
CREATE POLICY "Service role can insert submissions"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- Allow service role to select for rate limiting
CREATE POLICY "Service role can view submissions"
ON public.contact_submissions
FOR SELECT
USING (true);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.contact_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for rate limiting queries
CREATE INDEX idx_contact_submissions_ip_created ON public.contact_submissions(ip_address, created_at);