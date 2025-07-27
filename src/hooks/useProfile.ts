
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export interface Profile {
  id: string;
  user_id: string;
  company_id: string | null;
  access_level_id: string | null;
  stripe_customer_id: string | null;
  is_super_admin: boolean;
  display_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  access_levels?: {
    id: string;
    name: string;
    display_name: string;
    permissions: Record<string, boolean>;
    is_active: boolean;
  };
  companies?: {
    id: string;
    name: string;
    document: string;
    email?: string;
  };
}

export function useProfile() {
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
            display_name,
            permissions,
            is_active
          ),
          companies (
            id,
            name,
            document,
            email
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) return null;

      // Convert the data to match the Profile interface
      const profile: Profile = {
        id: data.id,
        user_id: data.user_id,
        company_id: data.company_id || null,
        access_level_id: data.access_level_id || null,
        stripe_customer_id: data.stripe_customer_id || null,
        is_super_admin: data.is_super_admin || false,
        display_name: data.display_name || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        avatar_url: data.avatar_url || undefined,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        access_levels: data.access_levels ? {
          id: data.access_levels.id,
          name: data.access_levels.name,
          display_name: data.access_levels.display_name,
          permissions: (data.access_levels.permissions as Record<string, boolean>) || {},
          is_active: data.access_levels.is_active
        } : undefined,
        companies: data.companies ? {
          id: data.companies.id,
          name: data.companies.name,
          document: data.companies.document,
          email: data.companies.email
        } : undefined
      };

      return profile;
    },
    enabled: !!user?.id,
  });

  const isSuperAdmin = profile?.is_super_admin || false;
  const hasActiveCompany = !!profile?.company_id;
  const hasActiveSubscription = !!profile?.stripe_customer_id;
  const accessLevel = profile?.access_levels;

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (!accessLevel?.permissions) return false;
    return accessLevel.permissions[permission] === true;
  };

  const canAccessRoute = (route: string): boolean => {
    if (isSuperAdmin) return true;
    
    // Map routes to permissions
    const routePermissions: Record<string, string> = {
      '/app/dashboard': 'dashboard',
      '/app/vendas': 'vendas',
      '/app/produtos': 'produtos',
      '/app/clientes': 'clientes',
      '/app/financeiro': 'financeiro',
      '/app/relatorios': 'relatorios',
      '/app/configuracoes': 'configuracoes',
      '/app/admin': 'admin_panel',
    };

    const requiredPermission = routePermissions[route];
    if (!requiredPermission) return true;

    return hasPermission(requiredPermission);
  };

  const needsSubscriptionRedirect = (): boolean => {
    if (isSuperAdmin) return false;
    if (!hasActiveCompany) return true;
    if (!hasActiveSubscription) return true;
    return false;
  };

  return {
    profile,
    isLoading,
    error,
    isSuperAdmin,
    hasActiveCompany,
    hasActiveSubscription,
    accessLevel,
    hasPermission,
    canAccessRoute,
    needsSubscriptionRedirect,
  };
}
