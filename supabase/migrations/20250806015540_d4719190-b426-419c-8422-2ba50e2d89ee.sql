-- Corrigir políticas RLS da tabela user_companies que estão causando erro 406

-- Remover políticas antigas da tabela user_companies
DROP POLICY IF EXISTS "user_companies_select_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_insert_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_update_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_delete_policy" ON public.user_companies;

-- Criar novas políticas simplificadas para user_companies
CREATE POLICY "user_companies_access_policy"
ON public.user_companies
FOR SELECT
USING (
  is_super_admin() 
  OR user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_companies uc2 
    WHERE uc2.user_id = auth.uid() 
      AND uc2.company_id = user_companies.company_id 
      AND uc2.role IN ('contratante', 'super_admin')
      AND uc2.is_active = true
  )
);

CREATE POLICY "user_companies_insert_policy"
ON public.user_companies
FOR INSERT
WITH CHECK (
  is_super_admin() 
  OR (
    auth.uid() IS NOT NULL 
    AND (
      user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM public.user_companies uc2 
        WHERE uc2.user_id = auth.uid() 
          AND uc2.company_id = user_companies.company_id 
          AND uc2.role IN ('contratante', 'super_admin')
          AND uc2.is_active = true
      )
    )
  )
);

CREATE POLICY "user_companies_update_policy"
ON public.user_companies
FOR UPDATE
USING (
  is_super_admin() 
  OR user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_companies uc2 
    WHERE uc2.user_id = auth.uid() 
      AND uc2.company_id = user_companies.company_id 
      AND uc2.role IN ('contratante', 'super_admin')
      AND uc2.is_active = true
  )
)
WITH CHECK (
  is_super_admin() 
  OR user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_companies uc2 
    WHERE uc2.user_id = auth.uid() 
      AND uc2.company_id = user_companies.company_id 
      AND uc2.role IN ('contratante', 'super_admin')
      AND uc2.is_active = true
  )
);

CREATE POLICY "user_companies_delete_policy"
ON public.user_companies
FOR DELETE
USING (
  is_super_admin() 
  OR EXISTS (
    SELECT 1 FROM public.user_companies uc2 
    WHERE uc2.user_id = auth.uid() 
      AND uc2.company_id = user_companies.company_id 
      AND uc2.role IN ('contratante', 'super_admin')
      AND uc2.is_active = true
  )
);