-- Create DOT Inspections table
CREATE TABLE public.dot_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trailer_id UUID NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES public.profiles(id),
  inspection_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  trailer_number TEXT NOT NULL,
  vin TEXT,
  license_plate TEXT,
  trailer_type TEXT,
  
  -- Brakes & Air System
  brakes_operational BOOLEAN DEFAULT FALSE,
  no_air_leaks BOOLEAN DEFAULT FALSE,
  brake_chambers_secure BOOLEAN DEFAULT FALSE,
  air_hoses_secure BOOLEAN DEFAULT FALSE,
  brake_adjustment_confirmed BOOLEAN DEFAULT FALSE,
  brakes_comments TEXT,
  
  -- Tires & Wheels
  tires_tread_depth BOOLEAN DEFAULT FALSE,
  tires_no_damage BOOLEAN DEFAULT FALSE,
  tires_inflation BOOLEAN DEFAULT FALSE,
  lug_nuts_secure BOOLEAN DEFAULT FALSE,
  rims_no_damage BOOLEAN DEFAULT FALSE,
  tires_comments TEXT,
  
  -- Lights & Electrical
  brake_lights_operational BOOLEAN DEFAULT FALSE,
  turn_signals_operational BOOLEAN DEFAULT FALSE,
  marker_lights_operational BOOLEAN DEFAULT FALSE,
  no_broken_lenses BOOLEAN DEFAULT FALSE,
  lights_comments TEXT,
  
  -- Frame, Body & Structural
  frame_no_cracks BOOLEAN DEFAULT FALSE,
  undercarriage_secure BOOLEAN DEFAULT FALSE,
  floor_intact BOOLEAN DEFAULT FALSE,
  sidewalls_roof_intact BOOLEAN DEFAULT FALSE,
  no_sharp_edges BOOLEAN DEFAULT FALSE,
  frame_comments TEXT,
  
  -- Doors, Landing Gear & Securement
  rear_doors_operational BOOLEAN DEFAULT FALSE,
  hinges_locks_seals_intact BOOLEAN DEFAULT FALSE,
  landing_gear_operational BOOLEAN DEFAULT FALSE,
  crank_handle_secure BOOLEAN DEFAULT FALSE,
  mud_flaps_present BOOLEAN DEFAULT FALSE,
  doors_comments TEXT,
  
  -- Coupling & Kingpin
  kingpin_secure BOOLEAN DEFAULT FALSE,
  apron_intact BOOLEAN DEFAULT FALSE,
  no_coupling_damage BOOLEAN DEFAULT FALSE,
  coupling_comments TEXT,
  
  -- Reflective Tape & Safety Markings
  dot_reflective_tape_present BOOLEAN DEFAULT FALSE,
  conspicuity_markings_intact BOOLEAN DEFAULT FALSE,
  reflective_comments TEXT,
  
  -- Final Acknowledgment
  inspector_signature TEXT,
  dot_release_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Customer Acknowledgment
  customer_acknowledged BOOLEAN DEFAULT FALSE,
  customer_name TEXT,
  customer_signature TEXT,
  customer_acknowledged_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create DOT Inspection Photos table
CREATE TABLE public.dot_inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.dot_inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dot_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dot_inspection_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dot_inspections
CREATE POLICY "Admins can view all inspections"
ON public.dot_inspections FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert inspections"
ON public.dot_inspections FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update inspections"
ON public.dot_inspections FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete inspections"
ON public.dot_inspections FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mechanics can view their inspections"
ON public.dot_inspections FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'mechanic'::app_role) AND inspector_id = auth.uid());

CREATE POLICY "Mechanics can insert their inspections"
ON public.dot_inspections FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'mechanic'::app_role) AND inspector_id = auth.uid());

CREATE POLICY "Mechanics can update their inspections"
ON public.dot_inspections FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'mechanic'::app_role) AND inspector_id = auth.uid());

-- RLS Policies for dot_inspection_photos
CREATE POLICY "Admins can manage all photos"
ON public.dot_inspection_photos FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mechanics can view their inspection photos"
ON public.dot_inspection_photos FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'mechanic'::app_role) AND
  inspection_id IN (SELECT id FROM public.dot_inspections WHERE inspector_id = auth.uid())
);

CREATE POLICY "Mechanics can insert their inspection photos"
ON public.dot_inspection_photos FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'mechanic'::app_role) AND
  inspection_id IN (SELECT id FROM public.dot_inspections WHERE inspector_id = auth.uid())
);

CREATE POLICY "Mechanics can delete their inspection photos"
ON public.dot_inspection_photos FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'mechanic'::app_role) AND
  inspection_id IN (SELECT id FROM public.dot_inspections WHERE inspector_id = auth.uid())
);

-- Create storage bucket for inspection photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dot-inspection-photos', 'dot-inspection-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for inspection photos
CREATE POLICY "Mechanics can upload inspection photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dot-inspection-photos' AND
  has_role(auth.uid(), 'mechanic'::app_role)
);

CREATE POLICY "Anyone can view inspection photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'dot-inspection-photos');

CREATE POLICY "Mechanics can delete their inspection photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dot-inspection-photos' AND
  has_role(auth.uid(), 'mechanic'::app_role)
);

-- Create updated_at trigger
CREATE TRIGGER update_dot_inspections_updated_at
BEFORE UPDATE ON public.dot_inspections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();