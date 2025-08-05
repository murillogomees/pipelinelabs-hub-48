
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
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
        .eq('id', user.id)
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
    profile: useQuery.data,
    isLoading: useQuery.isLoading,
    error: useQuery.error,
    isSuperAdmin,
    hasPermission,
    canAccessRoute
  };
};
