-- FASE 1: OTIMIZAÇÕES EMERGENCIAIS DE PERFORMANCE

-- 1. Otimizar índices da tabela companies (CRÍTICO - 161,982 seq scans!)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_user_id_active 
ON public.companies(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_document_hash 
ON public.companies USING HASH(document);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_name_trgm 
ON public.companies USING gin(name gin_trgm_ops);

-- 2. Otimizar consultas em profiles 
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_active 
ON public.profiles(email) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_company_access 
ON public.profiles(company_id, access_level_id) 
WHERE is_active = true;

-- 3. Otimizar outras tabelas com scan alto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_company_active 
ON public.customers(company_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_company_active 
ON public.products(company_id, is_active);

-- 4. Adicionar índices para queries comuns de analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_company_date 
ON public.analytics_events(company_id, created_at DESC);

-- 5. Otimizar notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_company_user_date 
ON public.notifications(company_id, created_at DESC) 
WHERE read_at IS NULL;