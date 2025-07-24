-- Fix remaining database function security issues

-- Update update_landing_page_config_updated_at with secure search path
CREATE OR REPLACE FUNCTION public.update_landing_page_config_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update check_request with secure search path
CREATE OR REPLACE FUNCTION public.check_request()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    v_result boolean := false;
BEGIN
    -- Check if there are any companies in the system
    IF EXISTS (SELECT 1 FROM public.companies WHERE id IS NOT NULL) THEN
        v_result := true;
    END IF;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error or handle it appropriately
        RAISE WARNING 'Error in check_request: %', SQLERRM;
        RETURN false;
END;
$function$;

-- Update update_modified_column with secure search path
CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update validate_cnpj with secure search path (if it exists)
CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    cnpj_clean text;
    digit1 integer;
    digit2 integer;
    sum1 integer := 0;
    sum2 integer := 0;
    i integer;
BEGIN
    -- Clean CNPJ - remove non-numeric characters
    cnpj_clean := regexp_replace(cnpj_input, '[^0-9]', '', 'g');
    
    -- Check if CNPJ has 14 digits
    IF length(cnpj_clean) != 14 THEN
        RETURN false;
    END IF;
    
    -- Check for repeated digits (invalid CNPJs)
    IF cnpj_clean ~ '^(.)\1{13}$' THEN
        RETURN false;
    END IF;
    
    -- Calculate first verification digit
    FOR i IN 1..12 LOOP
        sum1 := sum1 + (substring(cnpj_clean FROM i FOR 1)::integer * (CASE WHEN i <= 4 THEN (6 - i) ELSE (14 - i) END));
    END LOOP;
    
    digit1 := 11 - (sum1 % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calculate second verification digit
    FOR i IN 1..13 LOOP
        sum2 := sum2 + (substring(cnpj_clean FROM i FOR 1)::integer * (CASE WHEN i <= 5 THEN (7 - i) ELSE (15 - i) END));
    END LOOP;
    
    digit2 := 11 - (sum2 % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verify digits
    RETURN (substring(cnpj_clean FROM 13 FOR 1)::integer = digit1) 
       AND (substring(cnpj_clean FROM 14 FOR 1)::integer = digit2);
END;
$function$;