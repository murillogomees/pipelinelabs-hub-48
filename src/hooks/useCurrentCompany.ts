
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { retryWithBackoff, shouldRetryError } from '@/utils/networkRetry';

export const useCurrentCompany = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['current-company', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      return retryWithBackoff(async () => {
        console.log('🔄 Buscando empresa do usuário:', user.id);
        
        // Buscar empresa do usuário através da relação user_companies
        const { data: userCompany, error: userCompanyError } = await supabase
          .from('user_companies')
          .select(`
            company_id,
            role,
            companies (
              id,
              name,
              document
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (userCompanyError) {
          console.error('❌ Error fetching user company:', userCompanyError);
          
          // Se é um erro de infraestrutura do Supabase, throw para retry
          if (userCompanyError.code === 'PGRST002' || shouldRetryError(userCompanyError)) {
            throw userCompanyError;
          }
          
          return null;
        }

        if (userCompany) {
          console.log('✅ Empresa encontrada:', userCompany.companies?.name);
          return {
            company_id: userCompany.company_id,
            company: userCompany.companies,
            role: userCompany.role
          };
        }

        return null;
      }, {
        maxRetries: 5,
        baseDelay: 2000,
        maxDelay: 30000,
        backoffMultiplier: 2
      });
    },
    enabled: !!user?.id,
    retry: (failureCount, error: any) => {
      // Retry até 3 vezes para erros de infraestrutura
      if (error?.code === 'PGRST002' || shouldRetryError(error)) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
    gcTime: 5 * 60 * 1000 // 5 minutos de garbage collection
  });
};
