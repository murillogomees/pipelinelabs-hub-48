import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type UserType = 'super_admin' | 'contratante' | 'operador';

interface UserPermissions {
  userType: UserType | null;
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  isAdmin: boolean; // Legacy compatibility
  companyId: string | null;
  department: string | null;
  specificPermissions: Record<string, boolean>;
  email: string | null;
}

export function usePermissions() {
  const { data: permissionsData, isLoading, error } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          return {
            userType: null,
            isSuperAdmin: false,
            isContratante: false,
            isOperador: false,
            isAdmin: false,
            companyId: null,
            department: null,
            specificPermissions: {},
            email: null
          };
        }

        
        // Verificar diretamente se é super admin pelo email
        const userEmail = user.user.email || "";
        const isSuperAdminByEmail = userEmail === "murilloggomes@gmail.com";
        
        // Se for super admin pelo email, retornar permissões completas
        if (isSuperAdminByEmail) {
          return {
            userType: 'super_admin' as UserType,
            isSuperAdmin: true,
            isContratante: false,
            isOperador: false,
            isAdmin: true,
            companyId: null,
            department: null,
            specificPermissions: {
              super_admin: true,
              full_access: true,
              admin_panel: true,
              user_management: true,
              company_management: true,
              system_settings: true
            },
            email: userEmail
          };
        }

        // Tentar buscar dados do usuário normalmente
        try {
          const { data: userCompaniesData, error: companiesError } = await supabase
            .from("user_companies")
            .select("user_type, department, specific_permissions, is_active, company_id, role")
            .eq("user_id", user.user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (companiesError) {
            console.error("Error fetching user companies:", companiesError);
            // Se der erro mas é super admin, retornar permissões completas
            if (isSuperAdminByEmail) {
              return {
                userType: 'super_admin' as UserType,
                isSuperAdmin: true,
                isContratante: false,
                isOperador: false,
                isAdmin: true,
                companyId: null,
                department: null,
                specificPermissions: { super_admin: true, full_access: true },
                email: userEmail
              };
            }
            throw companiesError;
          }

          if (!userCompaniesData) {
            return {
              userType: null,
              isSuperAdmin: isSuperAdminByEmail,
              isContratante: false,
              isOperador: false,
              isAdmin: isSuperAdminByEmail,
              companyId: null,
              department: null,
              specificPermissions: isSuperAdminByEmail ? { super_admin: true } : {},
              email: userEmail
            };
          }

          const userType = userCompaniesData.user_type as UserType;
          const specificPermissions = (userCompaniesData.specific_permissions as Record<string, any>) || {};
          
          const isSuperAdmin = userType === 'super_admin' || isSuperAdminByEmail;
          const isContratante = userType === 'contratante';
          const isOperador = userType === 'operador';
          const isAdmin = isSuperAdmin || isContratante;

          return {
            userType,
            isSuperAdmin,
            isContratante,
            isOperador,
            isAdmin,
            companyId: userCompaniesData.company_id,
            department: userCompaniesData.department,
            specificPermissions: isSuperAdminByEmail ? { ...specificPermissions, super_admin: true, full_access: true } : specificPermissions,
            email: userEmail
          } as UserPermissions;
        } catch (dbError) {
          // Se houver erro no banco mas é super admin, permitir acesso
          if (isSuperAdminByEmail) {
            return {
              userType: 'super_admin' as UserType,
              isSuperAdmin: true,
              isContratante: false,
              isOperador: false,
              isAdmin: true,
              companyId: null,
              department: null,
              specificPermissions: { super_admin: true, full_access: true },
              email: userEmail
            };
          }
          throw dbError;
        }
      } catch (error) {
        console.error("Error in usePermissions:", error);
        
        // Verificar se é super admin pelo email mesmo com erro
        const { data: user } = await supabase.auth.getUser();
        const userEmail = user.user?.email || "";
        const isSuperAdminByEmail = userEmail === "murilloggomes@gmail.com";
        
        return {
          userType: isSuperAdminByEmail ? 'super_admin' as UserType : null,
          isSuperAdmin: isSuperAdminByEmail,
          isContratante: false,
          isOperador: false,
          isAdmin: isSuperAdminByEmail,
          companyId: null,
          department: null,
          specificPermissions: isSuperAdminByEmail ? { super_admin: true, full_access: true } : {},
          email: userEmail
        };
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    userType: permissionsData?.userType || null,
    isSuperAdmin: permissionsData?.isSuperAdmin || false,
    isContratante: permissionsData?.isContratante || false,
    isOperador: permissionsData?.isOperador || false,
    isAdmin: permissionsData?.isAdmin || false, // Legacy
    companyId: permissionsData?.companyId || null,
    department: permissionsData?.department || null,
    specificPermissions: permissionsData?.specificPermissions || {},
    permissions: permissionsData?.specificPermissions || {}, // Legacy compatibility
    email: permissionsData?.email || null,
    isLoading,
    hasFullAccess: permissionsData?.isSuperAdmin || false, // Legacy compatibility
    
    // Funções de conveniência específicas por hierarquia
    canManageSystem: permissionsData?.isSuperAdmin || false,
    canManageCompany: (permissionsData?.isSuperAdmin || permissionsData?.isContratante) || false,
    canManageUsers: (permissionsData?.isSuperAdmin || permissionsData?.isContratante) || false,
    canManagePlans: permissionsData?.isSuperAdmin || false,
    canAccessAdminPanel: (permissionsData?.isSuperAdmin || permissionsData?.isContratante) || false,
    canViewReports: (permissionsData?.isSuperAdmin || permissionsData?.isContratante || permissionsData?.specificPermissions?.reports) || false,
    
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
    }
  };
}