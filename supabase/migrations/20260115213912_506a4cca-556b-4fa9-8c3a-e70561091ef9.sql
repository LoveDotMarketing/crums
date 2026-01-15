-- Add payment setup tracking columns to customer_applications
ALTER TABLE public.customer_applications
ADD COLUMN IF NOT EXISTS payment_setup_status text DEFAULT 'pending' CHECK (payment_setup_status IN ('pending', 'sent', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS payment_setup_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id text;

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_customer_applications_payment_status 
ON public.customer_applications(payment_setup_status);

-- Add comment for clarity
COMMENT ON COLUMN public.customer_applications.payment_setup_status IS 'Status of ACH bank account setup: pending, sent, completed, failed';
COMMENT ON COLUMN public.customer_applications.payment_setup_sent_at IS 'When the ACH setup email was sent to customer';
COMMENT ON COLUMN public.customer_applications.stripe_payment_method_id IS 'Stripe PaymentMethod ID for the linked bank account';