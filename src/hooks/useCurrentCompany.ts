
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export const useCurrentCompany = () => {
  const { profile, isSuperAdmin } = useProfile();
  
  return useQuery({
    queryKey: ['current-company', profile?.company_id],
    queryFn: async () => {
      // Para super admin, sempre retornar Pipeline Labs ou primeira empresa
      if (isSuperAdmin) {
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

        // Fallback para primeira empresa
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

      // Para usuários normais, usar empresa do perfil
      if (profile?.company_id) {
        const { data: company, error } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', profile.company_id)
          .single();

        if (!error && company) {
          return {
            company_id: profile.company_id,
            company: company
          };
        }
      }

      throw new Error('Nenhuma empresa encontrada');
    },
    enabled: !!profile,
    retry: false
  });
};
