
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { retryWithBackoff, shouldRetryError } from '@/utils/networkRetry';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CurrentCompany');

export const useCurrentCompany = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['current-company', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      return retryWithBackoff(async () => {
        logger.info('🔄 Buscando empresa do usuário:', user.id);
        
        // First, try to get user company through user_companies relation
        const { data: userCompany, error: userCompanyError } = await supabase
          .from('user_companies')
          .select(`
            company_id,
            role,
            is_active,
            companies!inner (
              id,
              name,
              document,
              email,
              phone,
              address
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (userCompanyError) {
          logger.error('❌ Error fetching user company:', userCompanyError);
          
          // If it's infrastructure error, throw for retry
          if (userCompanyError.code === 'PGRST002' || shouldRetryError(userCompanyError)) {
            throw userCompanyError;
          }
          
          // For other errors, try direct company lookup
          logger.warn('Trying direct company lookup...');
          
          const { data: directCompany, error: directError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (directError) {
            logger.error('❌ Error fetching direct company:', directError);
            if (directError.code === 'PGRST002' || shouldRetryError(directError)) {
              throw directError;
            }
            
            // Return fallback data based on user metadata
            return {
              company_id: null,
              company: {
                id: `fallback_${user.id}`,
                name: user.user_metadata?.company_name || `${user.user_metadata?.first_name || 'Usuário'} - Empresa`,
                document: '',
                email: user.email || '',
                phone: user.user_metadata?.phone || '',
                address: ''
              },
              role: 'contratante'
            };
          }

          if (directCompany) {
            return {
              company_id: directCompany.id,
              company: directCompany,
              role: 'contratante'
            };
          }
          
          // No company found, return fallback
          return null;
        }

        if (userCompany && userCompany.companies) {
          logger.info('✅ Empresa encontrada:', userCompany.companies.name);
          return {
            company_id: userCompany.company_id,
            company: userCompany.companies,
            role: userCompany.role
          };
        }

        // No user company found, try direct lookup
        const { data: directCompany, error: directError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (directError) {
          if (directError.code === 'PGRST002' || shouldRetryError(directError)) {
            throw directError;
          }
        }

        if (directCompany) {
          return {
            company_id: directCompany.id,
            company: directCompany,
            role: 'contratante'
          };
        }

        return null;
      }, {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 1.5
      });
    },
    enabled: !!user?.id,
    retry: (failureCount, error: any) => {
      // For infrastructure errors, let the component handle fallback
      if (error?.code === 'PGRST002') {
        return failureCount < 1; // Reduced retries for PGRST002
      }
      
      if (shouldRetryError(error)) {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 1.5 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
};
