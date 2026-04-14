-- Add sales to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales';

-- Add SELECT policies for sales role on dashboard-relevant tables
CREATE POLICY "Sales can view trailers" ON public.trailers FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view customers" ON public.customers FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view tolls" ON public.tolls FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view billing history" ON public.billing_history FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view maintenance records" ON public.maintenance_records FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view applications" ON public.customer_applications FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view profiles" ON public.profiles FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));