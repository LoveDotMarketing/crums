
-- Create call_transcripts table for caching transcriptions
CREATE TABLE public.call_transcripts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_sid text NOT NULL UNIQUE,
  transcript_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage call transcripts"
ON public.call_transcripts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));
