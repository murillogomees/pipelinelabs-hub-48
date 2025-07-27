
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export const useUserCompany = () => {
  const { user } = useAuth();

  const { data: userCompany, isLoading, error } = useQuery({
    queryKey: ['user-company', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Mock implementation for now since user_companies table doesn't exist
      return {
        company_id: 'mock-company-id',
        company: { id: 'mock-company-id', name: 'Mock Company' }
      };
    },
    enabled: !!user?.id
  });

  return {
    userCompany,
    isLoading,
    error
  };
};
