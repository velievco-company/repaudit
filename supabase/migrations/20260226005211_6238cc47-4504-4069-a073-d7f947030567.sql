CREATE OR REPLACE FUNCTION public.reset_daily_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usage_limits
  SET audits_today = 0, last_reset = current_date, updated_at = now()
  WHERE last_reset < current_date;
END;
$$;