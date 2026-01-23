-- Update existing trailers with null rental rates to use type-based defaults
UPDATE trailers
SET 
  rental_rate = CASE
    WHEN type ILIKE '%flat%' OR type ILIKE '%flatbed%' THEN 750
    WHEN type ILIKE '%reefer%' OR type ILIKE '%refrigerated%' THEN 850
    ELSE 700  -- Dry Van default
  END,
  rental_frequency = COALESCE(rental_frequency, 'monthly')
WHERE rental_rate IS NULL OR rental_rate = 0;