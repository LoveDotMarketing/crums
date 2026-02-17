
-- Add work_order_id column to maintenance_records
ALTER TABLE public.maintenance_records
ADD COLUMN work_order_id uuid REFERENCES public.work_orders(id) ON DELETE SET NULL;

-- Create index for lookups
CREATE INDEX idx_maintenance_records_work_order_id ON public.maintenance_records(work_order_id);

-- Create trigger function: auto-create maintenance record when work order is approved
CREATE OR REPLACE FUNCTION public.create_maintenance_from_work_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only fire when status changes TO 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Insert maintenance record linked to this work order
    INSERT INTO public.maintenance_records (
      trailer_id,
      description,
      cost,
      maintenance_date,
      maintenance_type,
      mechanic_id,
      completed,
      status,
      source,
      work_order_id
    ) VALUES (
      NEW.trailer_id,
      NEW.repair_type || ' — ' || NEW.description,
      NEW.grand_total,
      COALESCE(NEW.work_completion_date, NEW.work_start_date),
      NEW.repair_type,
      NEW.mechanic_id,
      true,
      'completed',
      'work_order',
      NEW.id
    );

    -- Update trailer's total_maintenance_cost
    UPDATE public.trailers
    SET total_maintenance_cost = COALESCE(total_maintenance_cost, 0) + NEW.grand_total
    WHERE id = NEW.trailer_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to work_orders table
CREATE TRIGGER on_work_order_approved
  AFTER UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_maintenance_from_work_order();
