
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
        .limit(1);

      if (userCompanyError) {
        console.error('Error fetching user company:', userCompanyError);
        return null;
      }

      // Se há múltiplas empresas, pegar a primeira
      const firstCompany = userCompany && userCompany.length > 0 ? userCompany[0] : null;

      if (firstCompany) {
        return {
          company_id: firstCompany.company_id,
          company: firstCompany.companies,
          role: firstCompany.role
        };
      }

      // Se não encontrou, retornar null
      return null;
    },
    enabled: !!user?.id,
    retry: false,
    staleTime: 2 * 60 * 1000 // 2 minutos de cache
  });
};
