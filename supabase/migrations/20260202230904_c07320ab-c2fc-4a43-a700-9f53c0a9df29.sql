-- Create table to track customer trailer checkout agreements
CREATE TABLE public.trailer_checkout_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trailer_id UUID NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  release_request_id UUID REFERENCES public.trailer_release_requests(id) ON DELETE SET NULL,
  
  -- Pre-pickup agreement (signed remotely before showing up)
  pre_pickup_signed BOOLEAN DEFAULT FALSE,
  pre_pickup_signed_at TIMESTAMP WITH TIME ZONE,
  pre_pickup_document_url TEXT,
  pre_pickup_signer_name TEXT,
  pre_pickup_signer_ip TEXT,
  
  -- Final release agreement (signed on-site before hookup)
  final_release_signed BOOLEAN DEFAULT FALSE,
  final_release_signed_at TIMESTAMP WITH TIME ZONE,
  final_release_document_url TEXT,
  final_release_signer_name TEXT,
  final_release_signer_ip TEXT,
  
  -- ID verification by mechanic
  id_verified BOOLEAN DEFAULT FALSE,
  id_verified_at TIMESTAMP WITH TIME ZONE,
  id_verified_by UUID REFERENCES public.profiles(id),
  id_verification_notes TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pre_pickup_complete', 'ready_for_pickup', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trailer_checkout_agreements ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can manage all checkout agreements" 
ON public.trailer_checkout_agreements 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Mechanic policies
CREATE POLICY "Mechanics can view all checkout agreements" 
ON public.trailer_checkout_agreements 
FOR SELECT 
USING (has_role(auth.uid(), 'mechanic'::app_role));

CREATE POLICY "Mechanics can update checkout agreements for ID verification" 
ON public.trailer_checkout_agreements 
FOR UPDATE 
USING (has_role(auth.uid(), 'mechanic'::app_role));

CREATE POLICY "Mechanics can insert checkout agreements" 
ON public.trailer_checkout_agreements 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'mechanic'::app_role));

-- Customer policies (view their own)
CREATE POLICY "Customers can view their own checkout agreements" 
ON public.trailer_checkout_agreements 
FOR SELECT 
USING (
  has_role(auth.uid(), 'customer'::app_role) AND 
  customer_id IN (
    SELECT c.id FROM customers c
    JOIN profiles p ON p.email = c.email
    WHERE p.id = auth.uid()
  )
);

-- Customer can update their own agreements (for signing)
CREATE POLICY "Customers can sign their own agreements" 
ON public.trailer_checkout_agreements 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'customer'::app_role) AND 
  customer_id IN (
    SELECT c.id FROM customers c
    JOIN profiles p ON p.email = c.email
    WHERE p.id = auth.uid()
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trailer_checkout_agreements;

-- Add trigger for updated_at
CREATE TRIGGER update_trailer_checkout_agreements_updated_at
BEFORE UPDATE ON public.trailer_checkout_agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_checkout_agreements_trailer ON public.trailer_checkout_agreements(trailer_id);
CREATE INDEX idx_checkout_agreements_customer ON public.trailer_checkout_agreements(customer_id);
CREATE INDEX idx_checkout_agreements_status ON public.trailer_checkout_agreements(status);