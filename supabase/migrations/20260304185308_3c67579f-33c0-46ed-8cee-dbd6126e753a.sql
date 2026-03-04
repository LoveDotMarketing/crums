ALTER TABLE public.trailers
  ADD COLUMN IF NOT EXISTS door_type text,
  ADD COLUMN IF NOT EXISTS suspension_type text,
  ADD COLUMN IF NOT EXISTS empty_weight integer,
  ADD COLUMN IF NOT EXISTS last_pm_date date,
  ADD COLUMN IF NOT EXISTS inside_width text,
  ADD COLUMN IF NOT EXISTS side_post_spacing text,
  ADD COLUMN IF NOT EXISTS crossmember_spacing text,
  ADD COLUMN IF NOT EXISTS has_side_skirts boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS side_skirt_type text,
  ADD COLUMN IF NOT EXISTS tire_type text,
  ADD COLUMN IF NOT EXISTS tire_tread_condition text,
  ADD COLUMN IF NOT EXISTS floor_thickness text,
  ADD COLUMN IF NOT EXISTS roof_type text;