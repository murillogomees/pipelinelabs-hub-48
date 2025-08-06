
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCurrentCompany = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['current-company', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar empresa do usuário através da relação user_companies
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('user_companies')
        .select(`
          company_id,
          role,
          companies!inner (
            id,
            name,
            document
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!userCompanyError && userCompany) {
        return {
          company_id: userCompany.company_id,
          company: userCompany.companies,
          role: userCompany.role
        };
      }

      // Se não encontrou, retornar null em vez de buscar fallback
      return null;
    },
    enabled: !!user?.id,
    retry: false
  });
};
