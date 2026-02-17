
ALTER TABLE public.tolls ADD COLUMN stripe_invoice_id text;
ALTER TABLE public.tolls ADD COLUMN stripe_payment_intent_id text;
