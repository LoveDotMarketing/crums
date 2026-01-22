-- Add RLS policies for customers to view their own subscription data

-- customer_subscriptions: customers can view their own subscriptions
CREATE POLICY "Customers can view their own subscriptions"
ON public.customer_subscriptions
FOR SELECT
USING (
  has_role(auth.uid(), 'customer'::app_role) AND 
  customer_id IN (
    SELECT c.id FROM customers c
    JOIN profiles p ON p.email = c.email
    WHERE p.id = auth.uid()
  )
);

-- subscription_items: customers can view items for their subscriptions
CREATE POLICY "Customers can view their subscription items"
ON public.subscription_items
FOR SELECT
USING (
  has_role(auth.uid(), 'customer'::app_role) AND 
  subscription_id IN (
    SELECT cs.id FROM customer_subscriptions cs
    JOIN customers c ON c.id = cs.customer_id
    JOIN profiles p ON p.email = c.email
    WHERE p.id = auth.uid()
  )
);

-- billing_history: customers can view their own payment history
CREATE POLICY "Customers can view their billing history"
ON public.billing_history
FOR SELECT
USING (
  has_role(auth.uid(), 'customer'::app_role) AND 
  subscription_id IN (
    SELECT cs.id FROM customer_subscriptions cs
    JOIN customers c ON c.id = cs.customer_id
    JOIN profiles p ON p.email = c.email
    WHERE p.id = auth.uid()
  )
);