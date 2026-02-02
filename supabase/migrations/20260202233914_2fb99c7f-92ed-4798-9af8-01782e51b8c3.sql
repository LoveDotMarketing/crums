-- Add unique constraint on user_id to prevent duplicate applications
ALTER TABLE customer_applications ADD CONSTRAINT customer_applications_user_id_key UNIQUE (user_id);