CREATE TABLE public.bland_pathway_publishes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pathway_id text NOT NULL,
  version_number integer,
  version_name text,
  environment text NOT NULL DEFAULT 'production',
  published_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_bland_pathway_publishes_pathway ON public.bland_pathway_publishes(pathway_id, created_at DESC);

ALTER TABLE public.bland_pathway_publishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view publish history"
ON public.bland_pathway_publishes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert publish history"
ON public.bland_pathway_publishes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));