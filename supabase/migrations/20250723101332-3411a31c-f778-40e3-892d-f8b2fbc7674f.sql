-- Consolidar políticas RLS duplicadas para melhor performance

-- 1. ALERTS - Remover políticas redundantes e consolidar
DROP POLICY IF EXISTS "Companies can update their own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Companies can view their own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Super admins can manage all alerts" ON public.alerts;
DROP POLICY IF EXISTS "Super admins can view all alerts" ON public.alerts;
DROP POLICY IF EXISTS "System can create alerts" ON public.alerts;

-- Criar políticas consolidadas para alerts
CREATE POLICY "alerts_select_policy" ON public.alerts
FOR SELECT USING (
  can_access_company_data(company_id) OR is_super_admin()
);

CREATE POLICY "alerts_insert_policy" ON public.alerts
FOR INSERT WITH CHECK (
  is_super_admin() OR true -- System pode criar alertas
);

CREATE POLICY "alerts_update_policy" ON public.alerts
FOR UPDATE USING (
  can_access_company_data(company_id) OR is_super_admin()
);

CREATE POLICY "alerts_delete_policy" ON public.alerts
FOR DELETE USING (
  is_super_admin()
);

-- 2. ANALYTICS_EVENTS - Consolidar políticas
DROP POLICY IF EXISTS "Company analytics events access" ON public.analytics_events;
DROP POLICY IF EXISTS "Company analytics events insert" ON public.analytics_events;
DROP POLICY IF EXISTS "Super admins can view all analytics events" ON public.analytics_events;

-- Criar políticas consolidadas para analytics_events
CREATE POLICY "analytics_events_select_policy" ON public.analytics_events
FOR SELECT USING (
  can_access_company_data(company_id) OR is_super_admin()
);

CREATE POLICY "analytics_events_insert_policy" ON public.analytics_events
FOR INSERT WITH CHECK (
  can_access_company_data(company_id) OR is_super_admin()
);

-- 3. ANALYTICS_SNAPSHOTS - Consolidar políticas
DROP POLICY IF EXISTS "Company analytics snapshots access" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Company analytics snapshots management" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Super admins can manage all analytics snapshots" ON public.analytics_snapshots;

-- Criar políticas consolidadas para analytics_snapshots
CREATE POLICY "analytics_snapshots_select_policy" ON public.analytics_snapshots
FOR SELECT USING (
  can_access_company_data(company_id) OR is_super_admin()
);

CREATE POLICY "analytics_snapshots_management_policy" ON public.analytics_snapshots
FOR ALL USING (
  can_manage_company_data(company_id) OR is_super_admin()
);

-- 4. COMPANIES - Consolidar políticas
DROP POLICY IF EXISTS "Contratantes can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Contratantes can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;

-- Criar políticas consolidadas para companies
CREATE POLICY "companies_select_policy" ON public.companies
FOR SELECT USING (
  is_contratante(id) OR is_super_admin()
);

CREATE POLICY "companies_update_policy" ON public.companies
FOR UPDATE USING (
  is_contratante(id) OR is_super_admin()
);

CREATE POLICY "companies_management_policy" ON public.companies
FOR INSERT WITH CHECK (
  is_super_admin()
);

CREATE POLICY "companies_delete_policy" ON public.companies
FOR DELETE USING (
  is_super_admin()
);

-- 5. AUDIT_LOGS - Consolidar políticas
DROP POLICY IF EXISTS "Contratantes can view company audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Criar políticas consolidadas para audit_logs
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
FOR SELECT USING (
  is_contratante(company_id) OR is_super_admin()
);

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
FOR INSERT WITH CHECK (
  true -- Sistema pode inserir logs de auditoria
);

-- 6. BILLING_LOGS - Consolidar políticas
DROP POLICY IF EXISTS "Companies can view their own billing logs" ON public.billing_logs;
DROP POLICY IF EXISTS "Super admins can view all billing logs" ON public.billing_logs;
DROP POLICY IF EXISTS "System can insert billing logs" ON public.billing_logs;

-- Criar políticas consolidadas para billing_logs
CREATE POLICY "billing_logs_select_policy" ON public.billing_logs
FOR SELECT USING (
  can_access_company_data(company_id) OR is_super_admin()
);

CREATE POLICY "billing_logs_insert_policy" ON public.billing_logs
FOR INSERT WITH CHECK (
  true -- Sistema pode inserir logs de cobrança
);