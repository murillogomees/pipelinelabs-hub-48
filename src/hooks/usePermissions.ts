
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type UserType = 'super_admin' | 'contratante' | 'operador';

interface UserPermissions {
  userType: UserType | null;
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  isAdmin: boolean;
  companyId: string | null;
  department: string | null;
  specificPermissions: Record<string, boolean>;
  email: string | null;
  accessLevel: {
    id: string;
    name: string;
    display_name: string;
    permissions: Record<string, boolean>;
  } | null;
}

export function usePermissions() {
  const { data: permissionsData, isLoading, error } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async (): Promise<UserPermissions> => {
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user.user) {
          return {
            userType: null,
            isSuperAdmin: false,
            isContratante: false,
            isOperador: false,
            isAdmin: false,
            companyId: null,
            department: null,
            specificPermissions: {},
            email: null,
            accessLevel: null
          };
        }

        const userEmail = user.user.email || "";
        
        // Buscar dados do usuário
        const { data: userCompaniesData, error: companiesError } = await supabase
          .from("user_companies")
          .select(`
            user_type, 
            department, 
            specific_permissions, 
            is_active, 
            company_id, 
            role, 
            permissions,
            access_level_id
          `)
          .eq("user_id", user.user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (companiesError) {
          console.error("Error fetching user companies:", companiesError);
          throw companiesError;
        }

        if (!userCompaniesData) {
          return {
            userType: null,
            isSuperAdmin: false,
            isContratante: false,
            isOperador: false,
            isAdmin: false,
            companyId: null,
            department: null,
            specificPermissions: {},
            email: userEmail,
            accessLevel: null
          };
        }

        // Buscar access level separadamente se existir
        let accessLevel = null;
        if (userCompaniesData.access_level_id) {
          try {
            const { data: accessLevelData } = await supabase
              .from('access_levels')
              .select('id, name, display_name, permissions')
              .eq('id', userCompaniesData.access_level_id)
              .single();
            
            if (accessLevelData) {
              accessLevel = {
                id: accessLevelData.id,
                name: accessLevelData.name,
                display_name: accessLevelData.display_name,
                permissions: accessLevelData.permissions || {}
              };
            }
          } catch (error) {
            console.error('Error fetching access level:', error);
          }
        }

        const userType = userCompaniesData.user_type as UserType;
        const specificPermissions = (userCompaniesData.specific_permissions as Record<string, any>) || {};
        const permissions = (userCompaniesData.permissions as Record<string, any>) || {};
        const accessLevelPermissions = accessLevel?.permissions || {};
        
        // Combinar permissões: nível de acesso + específicas + gerais
        const allPermissions = { 
          ...accessLevelPermissions, 
          ...permissions, 
          ...specificPermissions 
        };
        
        const isSuperAdmin = accessLevel?.name === 'super_admin' || allPermissions.super_admin === true || userType === 'super_admin';
        const isContratante = accessLevel?.name === 'contratante' || userType === 'contratante';
        const isOperador = accessLevel?.name === 'operador' || userType === 'operador';
        const isAdmin = isSuperAdmin || isContratante;

        return {
          userType,
          isSuperAdmin,
          isContratante,
          isOperador,
          isAdmin,
          companyId: userCompaniesData.company_id,
          department: userCompaniesData.department,
          specificPermissions: allPermissions,
          email: userEmail,
          accessLevel
        } as UserPermissions;
      } catch (error) {
        console.error("Error in usePermissions:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error?.message?.includes('JWT')) return false;
      return failureCount < 2;
    },
    staleTime: 30 * 1000,
  });

  return {
    userType: permissionsData?.userType || null,
    isSuperAdmin: permissionsData?.isSuperAdmin || false,
    isContratante: permissionsData?.isContratante || false,
    isOperador: permissionsData?.isOperador || false,
    isAdmin: permissionsData?.isAdmin || false,
    companyId: permissionsData?.companyId || null,
    department: permissionsData?.department || null,
    specificPermissions: permissionsData?.specificPermissions || {},
    permissions: permissionsData?.specificPermissions || {},
    email: permissionsData?.email || null,
    accessLevel: permissionsData?.accessLevel || null,
    isLoading,
    hasFullAccess: permissionsData?.isSuperAdmin || false,
    
    // Funções de conveniência específicas por hierarquia
    canManageSystem: permissionsData?.isSuperAdmin || false,
    canManageCompany: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canManageUsers: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canManagePlans: permissionsData?.isSuperAdmin || false,
    canAccessAdminPanel: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canViewReports: permissionsData?.isSuperAdmin || permissionsData?.isContratante || permissionsData?.specificPermissions?.reports || false,
    
    // Super Admin bypass
    canBypassAllRestrictions: permissionsData?.isSuperAdmin || false,
    canAccessAnyCompany: permissionsData?.isSuperAdmin || false,
    canModifyAnyData: permissionsData?.isSuperAdmin || false,
    canDeleteAnyRecord: permissionsData?.isSuperAdmin || false,
    
    // Verificações específicas de permissão por funcionalidade
    hasPermission: (permission: string) => {
      if (permissionsData?.isSuperAdmin) return true;
      return permissionsData?.specificPermissions?.[permission] === true;
    },
    
    // Verificações por contexto
    canAccessDepartmentData: (companyId: string, department?: string) => {
      if (permissionsData?.isSuperAdmin) return true;
      if (permissionsData?.isContratante && permissionsData?.companyId === companyId) return true;
      if (permissionsData?.isOperador && permissionsData?.companyId === companyId) {
        return !department || permissionsData?.department === department;
      }
      return false;
    },
    
    canManageCompanyData: (companyId: string) => {
      if (permissionsData?.isSuperAdmin) return true;
      return permissionsData?.isContratante && permissionsData?.companyId === companyId;
    },

    canAccessRoute: (route: string) => {
      if (permissionsData?.isSuperAdmin) return true;
      
      const adminRoutes = ['/app/admin', '/app/configuracoes'];
      if (adminRoutes.some(adminRoute => route.startsWith(adminRoute))) {
        return permissionsData?.isContratante || false;
      }
      
      return true;
    },

    error
  };
}
