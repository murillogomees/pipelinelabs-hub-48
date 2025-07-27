
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export const useUserCompany = () => {
  const { user } = useAuth();

  const { data: userCompany, isLoading, error } = useQuery({
    queryKey: ['user-company', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: userCompanyData, error } = await supabase
        .from('user_companies')
        .select(`
          company_id,
          company:companies(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching user company:', error);
        return null;
      }

      return userCompanyData;
    },
    enabled: !!user?.id
  });

  return {
    userCompany,
    isLoading,
    error
  };
};
