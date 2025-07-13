import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserPermissions {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  permissions: Record<string, boolean>;
  email: string | null;
}

export function usePermissions() {
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        return {
          isSuperAdmin: false,
          isAdmin: false,
          permissions: {},
          email: null
        };
      }

      // Buscar permissões do usuário
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select(`
          email,
          user_companies!inner(
            role,
            permissions,
            is_active
          )
        `)
        .eq("user_id", user.user.id)
        .eq("user_companies.is_active", true)
        .maybeSingle();

      if (error || !profileData) {
        return {
          isSuperAdmin: false,
          isAdmin: false,
          permissions: {},
          email: user.user.email || null
        };
      }

      const userCompany = Array.isArray(profileData.user_companies) 
        ? profileData.user_companies[0] 
        : profileData.user_companies;
      const permissions = (userCompany?.permissions as Record<string, any>) || {};
      const isAdmin = userCompany?.role === "admin";
      const isSuperAdmin = permissions.super_admin === true;

      return {
        isSuperAdmin,
        isAdmin,
        permissions,
        email: profileData.email
      } as UserPermissions;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    isSuperAdmin: permissionsData?.isSuperAdmin || false,
    isAdmin: permissionsData?.isAdmin || false,
    permissions: permissionsData?.permissions || {},
    email: permissionsData?.email || null,
    isLoading,
    // Funções de conveniência para verificar permissões específicas
    canManageUsers: permissionsData?.isSuperAdmin || permissionsData?.permissions?.user_management,
    canManageCompanies: permissionsData?.isSuperAdmin || permissionsData?.permissions?.company_management,
    canManagePlans: permissionsData?.isSuperAdmin || permissionsData?.permissions?.plans_management,
    canAccessAdminPanel: permissionsData?.isSuperAdmin || permissionsData?.permissions?.admin_panel,
    hasFullAccess: permissionsData?.isSuperAdmin || permissionsData?.permissions?.full_access,
  };
}