import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

export const useCurrentCompany = () => {
  const { isSuperAdmin, isAdmin } = usePermissions();
  return useQuery({
    queryKey: ['current-company'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se é super admin pelo RPC
      const { data: isSuperAdminRPC } = await supabase.rpc('is_super_admin');
      
      // Para administradores, sempre retornar Pipeline Labs ou primeira empresa disponível
      if (isSuperAdminRPC || isSuperAdmin || isAdmin) {
        // Super admin sempre usa a empresa Pipeline Labs
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('name', 'Pipeline Labs')
          .maybeSingle();

        if (!companyError && company) {
          return {
            company_id: company.id,
            company: company
          };
        }

        // Fallback para primeira empresa se Pipeline Labs não existir
        const { data: fallbackCompany, error: fallbackError } = await supabase
          .from('companies')
          .select('id, name')
          .order('created_at')
          .limit(1)
          .maybeSingle();
        
        if (!fallbackError && fallbackCompany) {
          return {
            company_id: fallbackCompany.id,
            company: fallbackCompany
          };
        }

        // Para admins sem empresa, retornar null (eles podem acessar tudo mesmo sem empresa)
        return {
          company_id: null,
          company: null
        };
      }

      // Usuários normais usam sua empresa associada
      const { data: userCompanies, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id, company:companies(id, name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (companyError || !userCompanies || userCompanies.length === 0) {
        throw new Error('Usuário não possui empresa associada');
      }

      const userCompany = userCompanies[0];

      return {
        company_id: userCompany.company_id,
        company: userCompany.company
      };
    },
    retry: false
  });
};