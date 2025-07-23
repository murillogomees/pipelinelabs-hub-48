-- Otimizar políticas que ainda usam auth.uid() direto para melhor performance

-- 1. LGPD Requests - otimizar políticas
DROP POLICY IF EXISTS "Users can create their own LGPD requests" ON public.lgpd_requests;
DROP POLICY IF EXISTS "Users can view their own LGPD requests" ON public.lgpd_requests;

CREATE POLICY "lgpd_requests_user_insert_policy" ON public.lgpd_requests
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "lgpd_requests_user_select_policy" ON public.lgpd_requests
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- 2. Notifications - otimizar política que ainda usa auth.uid() direto
DROP POLICY IF EXISTS "Company notifications update" ON public.notifications;

CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (
  can_access_company_data(company_id) OR (user_id = (SELECT auth.uid()))
);

-- 3. Privacy Consents - otimizar políticas
DROP POLICY IF EXISTS "Users can create their own consents" ON public.privacy_consents;
DROP POLICY IF EXISTS "Users can update their own consents" ON public.privacy_consents;
DROP POLICY IF EXISTS "Users can view their own consents" ON public.privacy_consents;

CREATE POLICY "privacy_consents_user_insert_policy" ON public.privacy_consents
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "privacy_consents_user_update_policy" ON public.privacy_consents
FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "privacy_consents_user_select_policy" ON public.privacy_consents
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- 4. Profiles - otimizar política que ainda usa auth.uid() direto
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Contratantes can view company users profiles" ON public.profiles;

CREATE POLICY "profiles_user_update_policy" ON public.profiles
FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Recriar política para contratantes com versão otimizada
CREATE POLICY "profiles_contratante_select_policy" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM user_companies uc1,
         user_companies uc2
    WHERE uc1.user_id = (SELECT auth.uid())
      AND uc1.user_type = 'contratante'::user_type
      AND uc1.is_active = true
      AND uc2.user_id = profiles.user_id
      AND uc2.company_id = uc1.company_id
      AND uc2.is_active = true
  )
);

-- 5. SLA Acceptance - otimizar política
DROP POLICY IF EXISTS "Companies can create SLA acceptances" ON public.sla_acceptance;

CREATE POLICY "sla_acceptance_insert_policy" ON public.sla_acceptance
FOR INSERT WITH CHECK (
  can_access_company_data(company_id) AND (user_id = (SELECT auth.uid()))
);

-- 6. Subscribers - otimizar política
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;

CREATE POLICY "subscribers_user_select_policy" ON public.subscribers
FOR SELECT USING (
  (user_id = (SELECT auth.uid())) OR (email = (SELECT auth.email()))
);

-- 7. Terms Acceptance - otimizar políticas
DROP POLICY IF EXISTS "Users can create their own terms acceptance" ON public.terms_acceptance;
DROP POLICY IF EXISTS "Users can view their own terms acceptance" ON public.terms_acceptance;

CREATE POLICY "terms_acceptance_user_insert_policy" ON public.terms_acceptance
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "terms_acceptance_user_select_policy" ON public.terms_acceptance
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- 8. Transactions - otimizar política
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

CREATE POLICY "transactions_user_select_policy" ON public.transactions
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- 9. User Companies - otimizar política
DROP POLICY IF EXISTS "Users can view their own company associations" ON public.user_companies;

CREATE POLICY "user_companies_select_policy" ON public.user_companies
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- 10. User Dashboards - otimizar política
DROP POLICY IF EXISTS "Users can manage their own dashboards" ON public.user_dashboards;

CREATE POLICY "user_dashboards_management_policy" ON public.user_dashboards
FOR ALL USING (user_id = (SELECT auth.uid()));

-- 11. Storage Policies - otimizar políticas do storage
DROP POLICY IF EXISTS "Company users can delete their whitelabel assets" ON storage.objects;
DROP POLICY IF EXISTS "Company users can update their whitelabel assets" ON storage.objects;
DROP POLICY IF EXISTS "Company users can upload whitelabel assets" ON storage.objects;

-- Recriar políticas de storage com otimizações
CREATE POLICY "storage_whitelabel_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'whitelabel' AND 
  (SELECT auth.uid()) IS NOT NULL AND 
  (storage.foldername(name))[1] = (get_user_company_id())::text
);

CREATE POLICY "storage_whitelabel_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'whitelabel' AND 
  (SELECT auth.uid()) IS NOT NULL AND 
  (storage.foldername(name))[1] = (get_user_company_id())::text
);

CREATE POLICY "storage_whitelabel_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'whitelabel' AND 
  (SELECT auth.uid()) IS NOT NULL AND 
  (storage.foldername(name))[1] = (get_user_company_id())::text
);

CREATE POLICY "storage_whitelabel_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'whitelabel' AND 
  (SELECT auth.uid()) IS NOT NULL AND 
  (storage.foldername(name))[1] = (get_user_company_id())::text
);