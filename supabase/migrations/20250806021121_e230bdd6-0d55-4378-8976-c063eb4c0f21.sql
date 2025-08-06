-- Drop function with CASCADE to remove all dependencies
DROP FUNCTION IF EXISTS public.get_user_company_id() CASCADE;

-- Create a simple function that doesn't cause recursion issues
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple direct query without policy checks to avoid recursion
  RETURN (
    SELECT company_id 
    FROM public.user_companies
    WHERE user_id = auth.uid()
      AND is_active = true
    LIMIT 1
  );
END;
$$;

-- Recreate the storage policies that were dropped
CREATE POLICY "Companies can upload their own assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Companies can view their own assets" ON storage.objects
FOR SELECT USING (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Companies can update their own assets" ON storage.objects
FOR UPDATE USING (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Companies can delete their own assets" ON storage.objects
FOR DELETE USING (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);