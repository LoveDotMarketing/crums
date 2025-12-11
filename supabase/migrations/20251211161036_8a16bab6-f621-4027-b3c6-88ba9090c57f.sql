-- Add separate columns for MC number and DOT document upload
ALTER TABLE customer_applications 
ADD COLUMN IF NOT EXISTS mc_number text,
ADD COLUMN IF NOT EXISTS dot_number_url text;

-- Migrate existing mc_dot_number data to mc_number where it exists
UPDATE customer_applications 
SET mc_number = mc_dot_number 
WHERE mc_dot_number IS NOT NULL AND mc_number IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN customer_applications.mc_number IS 'Motor Carrier number (required, text)';
COMMENT ON COLUMN customer_applications.dot_number_url IS 'DOT registration document URL (required, image upload)';