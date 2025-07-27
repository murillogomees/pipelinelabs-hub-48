
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

      // Fetch profile with access levels
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          access_levels (
            id,
            name,
            display_name,
            permissions,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profileData) {
        return null;
      }

      // Fetch company data if profile has company_id
      let companyData = null;
      if (profileData.company_id) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id, name, document, email')
          .eq('id', profileData.company_id)
          .maybeSingle();

        if (!companyError && company) {
          companyData = company;
        }
      }

      const profile: Profile = {
        id: profileData.id,
        user_id: profileData.user_id,
        company_id: profileData.company_id,
        access_level_id: profileData.access_level_id,
        stripe_customer_id: profileData.stripe_customer_id,
        is_super_admin: profileData.is_super_admin || false,
        display_name: profileData.display_name || undefined,
        email: profileData.email || undefined,
        phone: profileData.phone || undefined,
        avatar_url: profileData.avatar_url || undefined,
        is_active: profileData.is_active,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        access_levels: profileData.access_levels ? {
          id: profileData.access_levels.id,
          name: profileData.access_levels.name,
          display_name: profileData.access_levels.display_name,
          permissions: (profileData.access_levels.permissions as Record<string, boolean>) || {},
          is_active: profileData.access_levels.is_active
        } : undefined,
        companies: companyData || undefined
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
