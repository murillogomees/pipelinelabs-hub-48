
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
        
        // Search for user company through user_companies relation
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
          
          // If it's a PGRST002 infrastructure error, throw for retry
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
        maxRetries: 3, // Reduced retries for faster fallback to manual setup
        baseDelay: 2000,
        maxDelay: 10000, // Reduced max delay
        backoffMultiplier: 1.5 // Less aggressive backoff
      });
    },
    enabled: !!user?.id,
    retry: (failureCount, error: any) => {
      // For infrastructure errors, let the component handle fallback
      if (error?.code === 'PGRST002') {
        return failureCount < 2; // Reduced retries for PGRST002
      }
      
      if (shouldRetryError(error)) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(2000 * 1.5 ** attemptIndex, 10000), // Faster retry delays
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true
  });
};
