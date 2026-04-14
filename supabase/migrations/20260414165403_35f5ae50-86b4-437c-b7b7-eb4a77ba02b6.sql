
CREATE POLICY "Sales can view customer subscriptions" ON public.customer_subscriptions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view dot inspections" ON public.dot_inspections FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view dot inspection photos" ON public.dot_inspection_photos FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view work orders" ON public.work_orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view work order line items" ON public.work_order_line_items FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view subscription items" ON public.subscription_items FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view referral codes" ON public.referral_codes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view referrals" ON public.referrals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view partners" ON public.partners FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view partner commissions" ON public.partner_commissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view staff profiles" ON public.staff_profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Sales can view performance reviews" ON public.performance_reviews FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales'::app_role));
