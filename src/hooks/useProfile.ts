
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
    permissions: string[];
  };
  is_super_admin: boolean;
  companies?: Array<{
    id: string;
    name: string;
  }>;
}

export function useProfile() {
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          access_levels (
            id,
            name,
            description,
            permissions
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return profile;
    },
    enabled: true,
  });

  const { data: userCompanies } = useQuery({
    queryKey: ['user-companies'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_companies')
        .select(`
          id,
          company_id,
          companies (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
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
    
    const permissions = profile?.access_levels?.permissions || [];
    // Handle Json[] type properly
    const permissionStrings = Array.isArray(permissions) ? 
      permissions.map(p => String(p)) : 
      [];
    
    return permissionStrings.includes(permission);
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

  // Get company_id from user_companies if available
  const userCompanyId = userCompanies?.[0]?.company_id;

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
    company_id: userCompanyId,
    stripe_customer_id: profile.stripe_customer_id,
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
    is_super_admin: isSuperAdmin,
    companies: userCompanies?.map(uc => ({
      id: uc.company_id || '',
      name: uc.companies?.name || ''
    })) || [],
  } : null;

  return {
    profile: transformedProfile,
    isLoading,
    error,
    isSuperAdmin,
    needsSubscriptionRedirect,
    userCompanies,
    hasPermission,
    canAccessRoute,
  };
}
