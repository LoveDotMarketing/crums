-- Create a function to delete customer application when customer is deleted
CREATE OR REPLACE FUNCTION public.delete_customer_application_on_customer_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the customer_application for this customer's email
  DELETE FROM public.customer_applications
  WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email = OLD.email
  );
  RETURN OLD;
END;
$$;

-- Create trigger to run before customer deletion
DROP TRIGGER IF EXISTS trigger_delete_customer_application ON public.customers;
CREATE TRIGGER trigger_delete_customer_application
  BEFORE DELETE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_customer_application_on_customer_delete();