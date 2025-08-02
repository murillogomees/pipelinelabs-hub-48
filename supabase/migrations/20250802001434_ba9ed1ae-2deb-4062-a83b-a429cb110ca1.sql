-- CRITICAL SECURITY FIX: Fix rate limiting and continue security improvements
-- This prevents search_path injection attacks and implements proper CSRF protection

-- Create CSRF tokens table for server-side validation
CREATE TABLE IF NOT EXISTS public.csrf_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '1 hour'),
  used_at timestamp with time zone,
  ip_address inet,
  user_agent text
);

-- Enable RLS on CSRF tokens
ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for CSRF tokens
CREATE POLICY "Users can only access their own CSRF tokens" 
ON public.csrf_tokens 
FOR ALL 
USING (auth.uid() = user_id);

-- Function to generate and store CSRF token
CREATE OR REPLACE FUNCTION public.generate_csrf_token(p_session_id text DEFAULT NULL, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_token text;
  current_user_id uuid := auth.uid();
BEGIN
  -- Generate cryptographically secure token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Clean up expired tokens for this user
  DELETE FROM public.csrf_tokens 
  WHERE user_id = current_user_id 
    AND (expires_at < now() OR used_at IS NOT NULL);
  
  -- Insert new token
  INSERT INTO public.csrf_tokens (
    token,
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    new_token,
    current_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent
  );
  
  RETURN new_token;
END;
$function$;

-- Function to validate CSRF token
CREATE OR REPLACE FUNCTION public.validate_csrf_token(p_token text, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  token_record record;
  current_user_id uuid := auth.uid();
BEGIN
  -- Find valid token
  SELECT * INTO token_record
  FROM public.csrf_tokens
  WHERE token = p_token
    AND user_id = current_user_id
    AND expires_at > now()
    AND used_at IS NULL;
  
  IF NOT FOUND THEN
    -- Log invalid token attempt
    PERFORM log_security_event(
      'csrf_token_validation_failed',
      current_user_id,
      p_ip_address,
      p_user_agent,
      jsonb_build_object('token_prefix', substring(p_token from 1 for 8)),
      'medium'
    );
    RETURN false;
  END IF;
  
  -- Mark token as used
  UPDATE public.csrf_tokens
  SET used_at = now()
  WHERE id = token_record.id;
  
  -- Log successful validation
  PERFORM log_security_event(
    'csrf_token_validated',
    current_user_id,
    p_ip_address,
    p_user_agent,
    jsonb_build_object('token_id', token_record.id),
    'low'
  );
  
  RETURN true;
END;
$function$;