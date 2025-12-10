-- Create login_attempts table for tracking failed logins
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT login_attempts_email_key UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write their own attempt records (needed for login flow)
CREATE POLICY "Anyone can check login attempts" 
ON public.login_attempts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert login attempts" 
ON public.login_attempts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update login attempts" 
ON public.login_attempts 
FOR UPDATE 
USING (true);

-- Create function to check and update login attempts
CREATE OR REPLACE FUNCTION public.check_login_attempt(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_max_attempts INTEGER := 5;
  v_lockout_minutes INTEGER := 15;
  v_result JSON;
BEGIN
  -- Get or create attempt record
  SELECT * INTO v_attempt FROM login_attempts WHERE email = lower(p_email);
  
  IF v_attempt IS NULL THEN
    -- No record exists, login allowed
    RETURN json_build_object('allowed', true, 'attempts_remaining', v_max_attempts);
  END IF;
  
  -- Check if currently locked
  IF v_attempt.locked_until IS NOT NULL AND v_attempt.locked_until > now() THEN
    RETURN json_build_object(
      'allowed', false, 
      'locked', true,
      'locked_until', v_attempt.locked_until,
      'minutes_remaining', CEIL(EXTRACT(EPOCH FROM (v_attempt.locked_until - now())) / 60)
    );
  END IF;
  
  -- If lock has expired, allow login
  IF v_attempt.locked_until IS NOT NULL AND v_attempt.locked_until <= now() THEN
    -- Reset the counter since lock expired
    UPDATE login_attempts 
    SET attempt_count = 0, locked_until = NULL, updated_at = now()
    WHERE email = lower(p_email);
    RETURN json_build_object('allowed', true, 'attempts_remaining', v_max_attempts);
  END IF;
  
  -- Check attempt count
  IF v_attempt.attempt_count >= v_max_attempts THEN
    -- Lock the account
    UPDATE login_attempts 
    SET locked_until = now() + (v_lockout_minutes || ' minutes')::INTERVAL, updated_at = now()
    WHERE email = lower(p_email);
    
    RETURN json_build_object(
      'allowed', false, 
      'locked', true,
      'locked_until', now() + (v_lockout_minutes || ' minutes')::INTERVAL,
      'minutes_remaining', v_lockout_minutes
    );
  END IF;
  
  RETURN json_build_object('allowed', true, 'attempts_remaining', v_max_attempts - v_attempt.attempt_count);
END;
$$;

-- Create function to record failed login
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_max_attempts INTEGER := 5;
  v_lockout_minutes INTEGER := 15;
BEGIN
  -- Upsert the attempt record
  INSERT INTO login_attempts (email, attempt_count, last_attempt_at)
  VALUES (lower(p_email), 1, now())
  ON CONFLICT (email) DO UPDATE SET
    attempt_count = login_attempts.attempt_count + 1,
    last_attempt_at = now(),
    updated_at = now()
  RETURNING * INTO v_attempt;
  
  -- Check if should lock
  IF v_attempt.attempt_count >= v_max_attempts THEN
    UPDATE login_attempts 
    SET locked_until = now() + (v_lockout_minutes || ' minutes')::INTERVAL
    WHERE email = lower(p_email);
    
    RETURN json_build_object(
      'locked', true,
      'attempts', v_attempt.attempt_count,
      'minutes_remaining', v_lockout_minutes
    );
  END IF;
  
  RETURN json_build_object(
    'locked', false,
    'attempts', v_attempt.attempt_count,
    'attempts_remaining', v_max_attempts - v_attempt.attempt_count
  );
END;
$$;

-- Create function to reset login attempts on successful login
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM login_attempts WHERE email = lower(p_email);
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_login_attempts_updated_at
BEFORE UPDATE ON public.login_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();