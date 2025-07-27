
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  document: string;
  document_type: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  zipcode?: string;
  avatar_url: string;
  is_active: boolean;
  access_level_id: string;
  created_at: string;
  updated_at: string;
  access_levels: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  };
  // Campos adicionais que podem existir
  company_id?: string;
  stripe_customer_id?: string;
  is_super_admin?: boolean;
  companies?: {
    id: string;
    name: string;
  };
}

export const useProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          access_levels (
            id,
            name,
            description,
            permissions
          ),
          companies (
            id,
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permission: string): boolean => {
    if (!profile?.access_levels?.permissions) return false;
    const permissions = Array.isArray(profile.access_levels.permissions) 
      ? profile.access_levels.permissions 
      : [];
    return permissions.includes(permission);
  };

  // Função para verificar se o usuário pode acessar uma rota
  const canAccessRoute = (route: string): boolean => {
    // Rotas públicas sempre acessíveis
    const publicRoutes = ['/auth', '/sla', '/privacidade', '/termos'];
    if (publicRoutes.includes(route)) return true;

    // Rotas admin só para super admin
    if (route.startsWith('/app/admin')) {
      return profile?.access_levels?.name === 'super_admin';
    }

    // Outras rotas do app requerem estar logado
    if (route.startsWith('/app')) {
      return !!profile && profile.is_active;
    }

    return true;
  };

  // Verificar se é super admin
  const isSuperAdmin = profile?.access_levels?.name === 'super_admin';

  // Função para verificar se precisa de redirecionamento de assinatura
  const needsSubscriptionRedirect = (): boolean => {
    if (isSuperAdmin) return false;
    // Verificar se existe stripe_customer_id no profile ou user_companies
    return !profile?.stripe_customer_id;
  };

  // Mapear dados do profile para compatibilidade
  const mappedProfile: Profile | null = profile ? {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name,
    document: profile.document,
    document_type: profile.document_type,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    zip_code: profile.zipcode,
    zipcode: profile.zipcode,
    avatar_url: profile.avatar_url,
    is_active: profile.is_active,
    access_level_id: profile.access_level_id,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    access_levels: {
      id: profile.access_levels?.id || '',
      name: profile.access_levels?.name || '',
      description: profile.access_levels?.description || '',
      permissions: Array.isArray(profile.access_levels?.permissions) 
        ? profile.access_levels.permissions.map(p => String(p))
        : []
    },
    // Campos opcionais que podem não existir no banco
    company_id: undefined,
    stripe_customer_id: undefined,
    is_super_admin: isSuperAdmin,
    companies: profile.companies || undefined,
  } : null;

  return {
    profile: mappedProfile,
    isLoading,
    error,
    hasPermission,
    canAccessRoute,
    isSuperAdmin,
    needsSubscriptionRedirect,
  };
};
