-- Create functions to access cron data (needed for edge functions)
CREATE OR REPLACE FUNCTION public.get_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  jobname text,
  schedule text,
  active boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
$$;

CREATE OR REPLACE FUNCTION public.get_cron_history(limit_count integer DEFAULT 50)
RETURNS TABLE (
  runid bigint,
  jobid bigint,
  jobname text,
  status text,
  start_time timestamptz,
  end_time timestamptz,
  return_message text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT 
    d.runid,
    d.jobid,
    j.jobname,
    d.status,
    d.start_time,
    d.end_time,
    d.return_message
  FROM cron.job_run_details d
  JOIN cron.job j ON j.jobid = d.jobid
  ORDER BY d.start_time DESC
  LIMIT limit_count;
$$;