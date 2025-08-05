
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  document: string;
  document_type: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  avatar_url: string;
  is_active: boolean;
  access_level_id: string;
  company_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  access_levels: {
    id: string;
    name: string;
    description: string;
    permissions: Record<string, boolean>;
  } | null;
  is_super_admin: boolean;
  companies?: Array<{
    id: string;
    name: string;
  }>;
}

export function useProfile() {
  const { toast } = useToast();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // First get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          display_name,
          document,
          document_type,
          phone,
          address,
          city,
          state,
          zipcode,
          avatar_url,
          is_active,
          access_level_id,
          company_id,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError) {
        console.error('Profile query error:', profileError);
        throw new Error(`Failed to load profile: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('No active profile found for user');
      }

      // Then get access level separately
      let accessLevel = null;
      if (profile.access_level_id) {
        const { data: accessLevelData, error: accessLevelError } = await supabase
          .from('access_levels')
          .select('id, name, description, permissions')
          .eq('id', profile.access_level_id)
          .eq('is_active', true)
          .maybeSingle();

        if (accessLevelError) {
          console.error('Access level query error:', accessLevelError);
        } else if (accessLevelData) {
          accessLevel = accessLevelData;
        }
      }

      return {
        ...profile,
        access_levels: accessLevel
      };
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('No authenticated user')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const isSuperAdmin = profile?.access_levels?.name === 'super_admin';

  const needsSubscriptionRedirect = (): boolean => {
    if (isSuperAdmin) return false;
    // Verificar se existe assinatura ativa
    return false; // Simplificado por enquanto
  };

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    
    if (!profile?.access_levels?.permissions) {
      return false;
    }

    const permissions = profile.access_levels.permissions;
    
    // Handle JSONB object permissions (new format)
    if (typeof permissions === 'object' && !Array.isArray(permissions)) {
      return Boolean(permissions[permission]);
    }
    
    // Fallback for array format (legacy)
    if (Array.isArray(permissions)) {
      return permissions.includes(permission);
    }
    
    return false;
  };

  const canAccessRoute = (route: string): boolean => {
    if (isSuperAdmin) return true;
    
    // Mapeamento de rotas para permissões
    const routePermissions: Record<string, string> = {
      '/app/dashboard': 'dashboard',
      '/app/vendas': 'vendas',
      '/app/produtos': 'produtos',
      '/app/clientes': 'clientes',
      '/app/fornecedores': 'fornecedores',
      '/app/estoque': 'estoque',
      '/app/financeiro': 'financeiro',
      '/app/relatorios': 'relatorios',
      '/app/configuracoes': 'configuracoes',
      '/app/admin': 'admin_panel',
      '/app/notas-fiscais': 'notas_fiscais',
      '/app/contratos': 'contratos',
      '/app/producao': 'producao',
      '/app/compras': 'compras',
      '/app/integracoes': 'integracoes',
    };

    const requiredPermission = routePermissions[route];
    if (!requiredPermission) return true;
    
    return hasPermission(requiredPermission);
  };

  const transformedProfile: Profile | null = profile ? {
    id: profile.id,
    user_id: profile.user_id,
    email: profile.email,
    display_name: profile.display_name,
    document: profile.document,
    document_type: profile.document_type,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    zipcode: profile.zipcode,
    avatar_url: profile.avatar_url,
    is_active: profile.is_active,
    access_level_id: profile.access_level_id,
    company_id: undefined, // Will be set by useCurrentCompany
    stripe_customer_id: undefined, // Will be set by subscription logic
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    access_levels: profile.access_levels ? {
      id: profile.access_levels.id,
      name: profile.access_levels.name,
      description: profile.access_levels.description,
      permissions: typeof profile.access_levels.permissions === 'object' && !Array.isArray(profile.access_levels.permissions)
        ? profile.access_levels.permissions
        : {}
    } : null,
    is_super_admin: isSuperAdmin,
    companies: [], // Will be populated by useCurrentCompany
  } : null;

  return {
    profile: transformedProfile,
    isLoading,
    error,
    isSuperAdmin,
    needsSubscriptionRedirect,
    userCompanies: [],
    hasPermission,
    canAccessRoute,
  };
}
