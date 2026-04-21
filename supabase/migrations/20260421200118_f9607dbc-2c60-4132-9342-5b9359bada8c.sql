
CREATE TABLE public.bland_pathway_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  pathway_id text NOT NULL,
  node_id text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pathway_id, node_id)
);

ALTER TABLE public.bland_pathway_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage bland nodes"
ON public.bland_pathway_nodes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bland_pathway_nodes_updated_at
BEFORE UPDATE ON public.bland_pathway_nodes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bland_node_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_record_id uuid NOT NULL REFERENCES public.bland_pathway_nodes(id) ON DELETE CASCADE,
  edited_by uuid,
  previous_prompt text,
  new_prompt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bland_node_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read bland node edits"
ON public.bland_node_edits
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert bland node edits"
ON public.bland_node_edits
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_bland_node_edits_node ON public.bland_node_edits(node_record_id, created_at DESC);

INSERT INTO public.bland_pathway_nodes (label, pathway_id, node_id, description)
VALUES (
  'Answer Questions — Main Hub',
  'REPLACE_WITH_PATHWAY_ID',
  'd4e5f6a7-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
  'Primary Q&A node for inventory and general questions. Update the pathway_id with your real Bland pathway ID.'
);
