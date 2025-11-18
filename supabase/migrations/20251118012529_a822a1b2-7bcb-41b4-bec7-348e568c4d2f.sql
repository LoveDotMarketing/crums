-- Create customer applications table
CREATE TABLE IF NOT EXISTS public.customer_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id),
  
  -- Contact Information
  phone_number text NOT NULL,
  secondary_contact_name text,
  secondary_contact_phone text,
  secondary_contact_relationship text,
  
  -- Document URLs (stored in Supabase Storage)
  contract_url text,
  ssn_card_url text,
  drivers_license_url text,
  insurance_docs_url text,
  
  -- Bank Information
  bank_name text,
  account_holder_name text,
  routing_number text,
  account_number text,
  
  -- Payment Preferences
  payment_method text CHECK (payment_method IN ('stripe', 'zelle', 'bank_transfer')),
  stripe_customer_id text,
  
  -- Trailer Preferences
  primary_trailer_id uuid REFERENCES public.trailers(id),
  backup_trailer_id uuid REFERENCES public.trailers(id),
  rental_start_date date,
  
  -- Application Status
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamp with time zone,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own application"
ON public.customer_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application"
ON public.customer_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending application"
ON public.customer_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'new');

CREATE POLICY "Admins can view all applications"
ON public.customer_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all applications"
ON public.customer_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_customer_applications_updated_at
BEFORE UPDATE ON public.customer_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for customer documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-documents', 'customer-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for customer documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'customer-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'customer-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all customer documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'customer-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);