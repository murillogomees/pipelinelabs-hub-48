
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

      try {
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
          .limit(1)
          .single();

        if (userCompanyError) {
          console.error('Error fetching user company:', userCompanyError);
          return null;
        }

        if (userCompany) {
          return {
            company_id: userCompany.company_id,
            company: userCompany.companies,
            role: userCompany.role
          };
        }

        return null;
      } catch (error) {
        console.error('Error in useCurrentCompany:', error);
        return null;
      }
    },
    enabled: !!user?.id,
    retry: false,
    staleTime: 2 * 60 * 1000 // 2 minutos de cache
  });
};
