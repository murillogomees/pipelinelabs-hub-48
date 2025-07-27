
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export function useUserCompany() {
  const { user } = useAuth();

  const { data: userCompany, isLoading } = useQuery({
    queryKey: ['user-company', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user profile to find company association
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (error || !profile?.company_id) {
        return null;
      }

      // Get company details
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyError) {
        console.error('Error fetching company:', companyError);
        return null;
      }

      return {
        company_id: company.id,
        company: company
      };
    },
    enabled: !!user?.id
  });

  return {
    userCompany,
    isLoading
  };
}
