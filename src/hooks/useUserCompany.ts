import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUserCompany() {
  return useQuery({
    queryKey: ['user-company'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');
      
      const { data: userCompany, error } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', userData.user.id)
        .single();
      
      if (error) throw error;
      return userCompany.company_id;
    },
    enabled: true,
  });
}