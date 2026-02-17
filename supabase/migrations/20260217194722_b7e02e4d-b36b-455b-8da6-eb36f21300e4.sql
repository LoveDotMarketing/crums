
-- Create service_catalog table
CREATE TABLE public.service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  parts_price numeric NULL,
  labor_price numeric NULL,
  labor_hours numeric NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage service catalog"
  ON public.service_catalog FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Mechanics can read
CREATE POLICY "Mechanics can read service catalog"
  ON public.service_catalog FOR SELECT
  USING (has_role(auth.uid(), 'mechanic'::app_role));

-- Seed data from the CRUMS Leasing Breakdown List
INSERT INTO public.service_catalog (name, category, parts_price, labor_price, labor_hours) VALUES
-- General
('Hourly Rate', 'General', NULL, 85, 1),
('Service Fee', 'General', NULL, 75, NULL),
('DOT Inspection', 'General', NULL, 67, NULL),
('Alignment', 'General', 250, NULL, NULL),
-- Tires and Wheels
('Recap Tire', 'Tires and Wheels', 275, NULL, NULL),
('Rim and Tire', 'Tires and Wheels', 350, NULL, NULL),
('Rim', 'Tires and Wheels', 75, NULL, NULL),
('Tire Repair', 'Tires and Wheels', 35, NULL, 0.5),
('Tire Lube', 'Tires and Wheels', 10, NULL, NULL),
('Valve Stem', 'Tires and Wheels', 10, NULL, NULL),
('Airline Hose', 'Tires and Wheels', 10, NULL, NULL),
('Lug Nut', 'Tires and Wheels', 5, NULL, NULL),
('TPMS Hose', 'Tires and Wheels', 25, NULL, NULL),
('Spindle Plugs', 'Tires and Wheels', 35, NULL, NULL),
('Tru-Tees', 'Tires and Wheels', 6, NULL, NULL),
('Mounting/Dismount', 'Tires and Wheels', NULL, 25, 0.5),
-- Maintenance Supplies
('Brake Cleaner', 'Maintenance Supplies', 10, NULL, NULL),
('Rags', 'Maintenance Supplies', 10, NULL, NULL),
('Gear Oil', 'Maintenance Supplies', 25, NULL, NULL),
('Grease Tube', 'Maintenance Supplies', 10, NULL, NULL),
('Hub Oil', 'Maintenance Supplies', 20, NULL, NULL),
-- Mud Flaps
('Mud Flap', 'Mud Flaps', 20, NULL, 0.25),
('Mudflap Bracket', 'Mud Flaps', 35, NULL, 0.5),
('Mudflap Bracket Spring Loaded', 'Mud Flaps', 50, NULL, 0.5),
('Straightening Bracket', 'Mud Flaps', NULL, 25, 0.5),
-- Hub and Bearings
('Hubcap', 'Hub and Bearings', 15, NULL, NULL),
('Hubcap and Gasket', 'Hub and Bearings', 20, NULL, NULL),
('Inner Bearing', 'Hub and Bearings', 40, NULL, NULL),
('Outer Bearing', 'Hub and Bearings', 35, NULL, NULL),
('Wheel Seal', 'Hub and Bearings', 15, NULL, 0.5),
-- Brakes
('Brakes', 'Brakes', 125, NULL, 1.5),
('Adjusting Brakes', 'Brakes', NULL, 15, 0.25),
('Brake Drums', 'Brakes', 100, NULL, 1),
('SR-5 Valve', 'Brakes', 125, NULL, 1),
('Cotter Pins Kit', 'Brakes', 5, NULL, NULL),
('S-Cam Bushing Kit', 'Brakes', 35, NULL, 1),
('S-Cam Brackets', 'Brakes', 50, NULL, 1),
('Slack Adjuster', 'Brakes', 75, NULL, 1),
('Brake Chamber (Welded)', 'Brakes', 115, NULL, 1),
('Brake Chamber (Cut Rod)', 'Brakes', 115, NULL, 1),
('Clevis/Pins', 'Brakes', 15, NULL, 0.25),
('Brake Chamber Hose', 'Brakes', 15, NULL, 0.5),
('Airbag (Small)', 'Brakes', 85, NULL, 1),
('Airbag (Medium)', 'Brakes', 95, NULL, 1),
('Airbag (Large)', 'Brakes', 115, NULL, 1),
('Airbag Valve', 'Brakes', 35, NULL, 0.5),
-- Electrical and Lights
('Red Gladhand', 'Electrical and Lights', 15, NULL, 0.25),
('Blue Gladhand', 'Electrical and Lights', 15, NULL, 0.25),
('7-Way Plug', 'Electrical and Lights', 25, NULL, 0.5),
('7-Way Box', 'Electrical and Lights', 35, NULL, 0.5),
('Clearance Light', 'Electrical and Lights', 10, NULL, 0.25),
('Marker Light', 'Electrical and Lights', 10, NULL, 0.25),
('Penny Light', 'Electrical and Lights', 8, NULL, 0.25),
('ABS Light', 'Electrical and Lights', 25, NULL, 0.5),
('ABS Sensors', 'Electrical and Lights', 75, NULL, 1),
-- Body and Structure
('Panel Patches', 'Body and Structure', 50, NULL, 1),
('Bolts and Nuts', 'Body and Structure', 5, NULL, NULL);
