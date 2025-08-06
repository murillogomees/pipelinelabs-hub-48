-- Recreate the policies that were dropped when the function was removed
-- For accounts_payable
DROP POLICY IF EXISTS "Company accounts_payable management" ON public.accounts_payable;
CREATE POLICY "Company accounts_payable management" ON public.accounts_payable
FOR INSERT WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro', company_id) 
  AND (company_id = get_user_company_id())
);

-- For accounts_receivable
DROP POLICY IF EXISTS "Company accounts_receivable management" ON public.accounts_receivable;
CREATE POLICY "Company accounts_receivable management" ON public.accounts_receivable
FOR INSERT WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro', company_id) 
  AND (company_id = get_user_company_id())
);

-- For customers - fix to allow super admins
DROP POLICY IF EXISTS "Customers insert policy" ON public.customers;
CREATE POLICY "Customers insert policy" ON public.customers
FOR INSERT WITH CHECK (
  is_super_admin() 
  OR (
    can_access_company_data(company_id) 
    AND (company_id = get_user_company_id())
  )
);