
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleData {
  userType: 'super_admin' | 'contratante' | 'operador' | null;
  companyId: string | null;
  department: string | null;
  specificPermissions: Record<string, boolean>;
}

export function useUserRole() {
  const { data: roleData, isLoading, error } = useQuery({
    queryKey: ["user-role"],
    queryFn: async (): Promise<UserRoleData> => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          return {
            userType: null,
            companyId: null,
            department: null,
            specificPermissions: {}
          };
        }

        // Verificar diretamente se é super admin pelo email
        const userEmail = user.user.email || "";
        const isSuperAdminByEmail = userEmail === "murilloggomes@gmail.com";
        
        if (isSuperAdminByEmail) {
          return {
            userType: 'super_admin',
            companyId: null,
            department: null,
            specificPermissions: {
              super_admin: true,
              full_access: true
            }
          };
        }

        // Buscar dados do usuário com tratamento de erro melhorado
        const { data: userCompaniesData, error: companiesError } = await supabase
          .from("user_companies")
          .select("user_type, department, specific_permissions, company_id")
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
            companyId: null,
            department: null,
            specificPermissions: {}
          };
        }

        return {
          userType: userCompaniesData.user_type || null,
          companyId: userCompaniesData.company_id,
          department: userCompaniesData.department,
          specificPermissions: (userCompaniesData.specific_permissions as Record<string, any>) || {}
        };
      } catch (error: any) {
        console.error("Error in useUserRole:", error);
        
        // Fallback para super admin mesmo com erro
        const { data: user } = await supabase.auth.getUser();
        const userEmail = user.user?.email || "";
        const isSuperAdminByEmail = userEmail === "murilloggomes@gmail.com";
        
        if (isSuperAdminByEmail) {
          return {
            userType: 'super_admin',
            companyId: null,
            department: null,
            specificPermissions: { super_admin: true, full_access: true }
          };
        }
        
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Não tentar novamente para erros de autenticação
      if (error?.message?.includes('JWT')) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    userType: roleData?.userType || null,
    companyId: roleData?.companyId || null,
    department: roleData?.department || null,
    specificPermissions: roleData?.specificPermissions || {},
    isLoading,
    error
  };
}

export function useRoleChecks() {
  const { userType, companyId, specificPermissions } = useUserRole();

  const canAccessSystemAdmin = () => {
    return userType === 'super_admin';
  };

  const canAccessCompanyAdmin = (targetCompanyId?: string) => {
    if (userType === 'super_admin') return true;
    if (userType === 'contratante') {
      return !targetCompanyId || companyId === targetCompanyId;
    }
    return false;
  };

  const canAccessOperationalData = (targetCompanyId?: string, targetDepartment?: string) => {
    if (userType === 'super_admin') return true;
    if (userType === 'contratante') {
      return !targetCompanyId || companyId === targetCompanyId;
    }
    if (userType === 'operador') {
      const companyMatch = !targetCompanyId || companyId === targetCompanyId;
      const departmentMatch = !targetDepartment || !targetDepartment;
      return companyMatch && departmentMatch;
    }
    return false;
  };

  const hasSpecificPermission = (permission: string) => {
    return specificPermissions[permission] === true;
  };

  return {
    canAccessSystemAdmin,
    canAccessCompanyAdmin,
    canAccessOperationalData,
    hasSpecificPermission
  };
}
