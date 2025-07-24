import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCurrentCompany = () => {
  return useQuery({
    queryKey: ['current-company'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se é super admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (isSuperAdmin) {
        // Super admin sempre usa a empresa Pipeline Labs
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('name', 'Pipeline Labs')
          .single();

        if (companyError || !company) {
          // Fallback para primeira empresa se Pipeline Labs não existir
          const { data: fallbackCompany, error: fallbackError } = await supabase
            .from('companies')
            .select('id, name')
            .order('created_at')
            .limit(1)
            .single();
          
          if (fallbackError || !fallbackCompany) {
            throw new Error('Empresa padrão não encontrada');
          }
          
          return {
            company_id: fallbackCompany.id,
            company: fallbackCompany
          };
        }

        return {
          company_id: company.id,
          company: company
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