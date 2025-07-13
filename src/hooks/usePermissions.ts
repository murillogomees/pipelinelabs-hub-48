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

      // Buscar permissões do usuário - como pode ter múltiplas empresas, pegamos a primeira ativa
      const { data: userCompaniesData, error: companiesError } = await supabase
        .from("user_companies")
        .select("role, permissions, is_active, company_id")
        .eq("user_id", user.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (companiesError) {
        console.error("Error fetching user companies:", companiesError);
        return {
          isSuperAdmin: false,
          isAdmin: false,
          permissions: {},
          email: user.user.email || null
        };
      }

      // Buscar email do perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", user.user.id)
        .maybeSingle();

      if (!userCompaniesData) {
        return {
          isSuperAdmin: false,
          isAdmin: false,
          permissions: {},
          email: profileData?.email || user.user.email || null
        };
      }

      const permissions = (userCompaniesData.permissions as Record<string, any>) || {};
      const isAdmin = userCompaniesData.role === "admin";
      // Super admin é apenas murilloggomes@gmail.com
      const userEmail = profileData?.email || user.user.email || "";
      const isSuperAdmin = userEmail === "murilloggomes@gmail.com";

      return {
        isSuperAdmin,
        isAdmin,
        permissions,
        email: profileData?.email || user.user.email || null
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