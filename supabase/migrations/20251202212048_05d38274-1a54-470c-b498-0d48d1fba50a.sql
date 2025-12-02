-- Add new columns to maintenance_records table
ALTER TABLE public.maintenance_records 
ADD COLUMN IF NOT EXISTS maintenance_type TEXT,
ADD COLUMN IF NOT EXISTS reported_by TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';