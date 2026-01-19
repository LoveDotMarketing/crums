-- Add customer checkout fields to dot_inspections table
ALTER TABLE public.dot_inspections
ADD COLUMN IF NOT EXISTS customer_review_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_condition_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_responsibility_understood BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_certification_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_company_name TEXT,
ADD COLUMN IF NOT EXISTS customer_signer_name TEXT;

-- RLS Policy: Customers can view inspections for their assigned trailers
CREATE POLICY "Customers can view their trailer inspections"
ON public.dot_inspections FOR SELECT
USING (
  public.has_role(auth.uid(), 'customer'::app_role) 
  AND trailer_id IN (
    SELECT t.id FROM public.trailers t
    JOIN public.customers c ON t.customer_id = c.id
    JOIN public.profiles p ON p.email = c.email
    WHERE p.id = auth.uid()
  )
);

-- RLS Policy: Customers can update only acknowledgment fields on completed inspections
CREATE POLICY "Customers can sign off on inspections"
ON public.dot_inspections FOR UPDATE
USING (
  public.has_role(auth.uid(), 'customer'::app_role) 
  AND status = 'completed'
  AND customer_acknowledged = FALSE
  AND trailer_id IN (
    SELECT t.id FROM public.trailers t
    JOIN public.customers c ON t.customer_id = c.id
    JOIN public.profiles p ON p.email = c.email
    WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'customer'::app_role)
);