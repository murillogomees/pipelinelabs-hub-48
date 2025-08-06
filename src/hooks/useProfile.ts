
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  access_level_id: string;
  address: string;
  avatar_url: string;
  city: string;
  company_id: string;
  created_at: string;
  display_name: string;
  document: string;
  document_type: string;
  email: string;
  id: string;
  phone: string;
  state: string;
  updated_at: string;
  user_id: string;
  zipcode: string;
  stripe_customer_id?: string;
  user_companies: any;
}

export const useProfile = () => {
  const { user } = useAuth();
  
  const queryResult = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar profile do usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_companies!inner (
            company_id,
            role,
            is_active,
            companies!inner (
              id,
              name,
              document
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('user_companies.is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return profile;
    },
    enabled: !!user?.id,
    retry: false
  });

  // Funções de permissão simplificadas por enquanto
  const hasPermission = (permission: string) => true;
  const canAccessRoute = (route: string) => true;
  const isSuperAdmin = false;

  return {
    profile: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    isSuperAdmin,
    hasPermission,
    canAccessRoute
  };
};
