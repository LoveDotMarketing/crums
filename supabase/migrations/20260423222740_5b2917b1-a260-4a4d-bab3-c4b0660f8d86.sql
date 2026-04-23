ALTER TABLE public.tolls
  ADD CONSTRAINT tolls_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.customers(id)
  ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';