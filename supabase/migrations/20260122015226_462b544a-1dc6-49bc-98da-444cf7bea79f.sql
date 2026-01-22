-- Create enum for billing cycles
CREATE TYPE billing_cycle AS ENUM ('weekly', 'biweekly', 'monthly');

-- Create enum for discount types
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed', 'multi_trailer', 'promo_code');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');

-- Customer Subscriptions table - one per customer
CREATE TABLE public.customer_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  next_billing_date DATE,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id)
);

-- Subscription Items table - trailers linked to subscriptions
CREATE TABLE public.subscription_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.customer_subscriptions(id) ON DELETE CASCADE,
  trailer_id UUID NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  stripe_subscription_item_id TEXT,
  monthly_rate DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, trailer_id)
);

-- Discounts table
CREATE TABLE public.discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type discount_type NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_trailers INTEGER DEFAULT 1,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Applied Discounts junction table
CREATE TABLE public.applied_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.customer_subscriptions(id) ON DELETE CASCADE,
  discount_id UUID NOT NULL REFERENCES public.discounts(id) ON DELETE CASCADE,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, discount_id)
);

-- Billing History table - payment records
CREATE TABLE public.billing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.customer_subscriptions(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  billing_period_start DATE,
  billing_period_end DATE,
  payment_method TEXT DEFAULT 'ach',
  failure_reason TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_subscriptions (admin only)
CREATE POLICY "Admins can manage customer subscriptions"
ON public.customer_subscriptions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subscription_items (admin only)
CREATE POLICY "Admins can manage subscription items"
ON public.subscription_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for discounts (admin only)
CREATE POLICY "Admins can manage discounts"
ON public.discounts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for applied_discounts (admin only)
CREATE POLICY "Admins can manage applied discounts"
ON public.applied_discounts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for billing_history (admin only)
CREATE POLICY "Admins can manage billing history"
ON public.billing_history
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update triggers
CREATE TRIGGER update_customer_subscriptions_updated_at
BEFORE UPDATE ON public.customer_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_items_updated_at
BEFORE UPDATE ON public.subscription_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
BEFORE UPDATE ON public.discounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_history_updated_at
BEFORE UPDATE ON public.billing_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_customer_subscriptions_customer ON public.customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subscriptions_status ON public.customer_subscriptions(status);
CREATE INDEX idx_subscription_items_subscription ON public.subscription_items(subscription_id);
CREATE INDEX idx_subscription_items_trailer ON public.subscription_items(trailer_id);
CREATE INDEX idx_billing_history_subscription ON public.billing_history(subscription_id);
CREATE INDEX idx_billing_history_status ON public.billing_history(status);
CREATE INDEX idx_discounts_code ON public.discounts(code) WHERE code IS NOT NULL;