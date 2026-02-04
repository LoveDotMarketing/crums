-- Add billing anchor day column to customer_applications
ALTER TABLE customer_applications
ADD COLUMN billing_anchor_day integer;

COMMENT ON COLUMN customer_applications.billing_anchor_day IS 
  'Preferred billing date: 1 for 1st of month, 15 for 15th of month';