
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

export const useCurrentCompany = () => {
  const { isSuperAdmin } = usePermissions();
  
  return useQuery({
    queryKey: ['current-company'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Para administradores, sempre retornar Pipeline Labs ou primeira empresa disponível
      if (isSuperAdmin) {
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
      }

      // Para usuários normais, usar a primeira empresa disponível
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .order('created_at')
        .limit(1)
        .maybeSingle();

      if (companyError || !company) {
        throw new Error('Nenhuma empresa encontrada');
      }

      return {
        company_id: company.id,
        company: company
      };
    },
    retry: false
  });
};
