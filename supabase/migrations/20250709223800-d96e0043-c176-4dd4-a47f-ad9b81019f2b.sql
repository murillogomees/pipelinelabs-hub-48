-- Create storage buckets for whitelabel assets
INSERT INTO storage.buckets (id, name, public) VALUES ('whitelabel', 'whitelabel', true);

-- Create storage policies for whitelabel bucket
CREATE POLICY "Authenticated users can view whitelabel assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'whitelabel');

CREATE POLICY "Company users can upload whitelabel assets" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'whitelabel' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_company_id()::text
);

CREATE POLICY "Company users can update their whitelabel assets" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'whitelabel' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_company_id()::text
);

CREATE POLICY "Company users can delete their whitelabel assets" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'whitelabel' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_company_id()::text
);