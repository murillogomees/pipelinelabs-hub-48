
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

      // Buscar profile do usuário (sem join para evitar 400 de relacionamento)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileErr && profileErr.code !== 'PGRST116') {
        throw profileErr;
      }

      if (!profile) return null;

      // Buscar vínculo ativo do usuário com empresa + dados da empresa
      const { data: uc, error: ucErr } = await supabase
        .from('user_companies')
        .select(`
          company_id,
          role,
          is_active,
          companies (
            id,
            name,
            document
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (ucErr && ucErr.code !== 'PGRST116') {
        throw ucErr;
      }

      return { ...profile, user_companies: uc ? [uc] : [] } as unknown as UserProfile;
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
