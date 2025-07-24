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

      const { data: userCompany, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id, company:companies(id, name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (companyError || !userCompany) {
        throw new Error('Usuário não possui empresa associada');
      }

      return {
        company_id: userCompany.company_id,
        company: userCompany.company
      };
    },
    retry: false
  });
};