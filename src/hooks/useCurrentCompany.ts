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