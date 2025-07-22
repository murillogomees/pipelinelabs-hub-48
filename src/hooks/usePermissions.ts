import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFallbackPermissions } from "./useFallbackPermissions";

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
  const { data: fallbackData } = useFallbackPermissions();
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

        // Buscar dados do usuário com novo sistema
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
          return {
            userType: null,
            isSuperAdmin: false,
            isContratante: false,
            isOperador: false,
            isAdmin: false,
            companyId: null,
            department: null,
            specificPermissions: {},
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
            userType: null,
            isSuperAdmin: false,
            isContratante: false,
            isOperador: false,
            isAdmin: false,
            companyId: null,
            department: null,
            specificPermissions: {},
            email: profileData?.email || user.user.email || null
          };
        }

        const userType = userCompaniesData.user_type as UserType;
        const specificPermissions = (userCompaniesData.specific_permissions as Record<string, any>) || {};
        const userEmail = profileData?.email || user.user.email || "";
        
        // Verificar se é super admin (tanto pelo tipo quanto pelo email)
        const isSuperAdmin = userType === 'super_admin' || userEmail === "murilloggomes@gmail.com";
        const isContratante = userType === 'contratante';
        const isOperador = userType === 'operador';
        
        // Legacy compatibility
        const isAdmin = isSuperAdmin || isContratante;

        return {
          userType,
          isSuperAdmin,
          isContratante,
          isOperador,
          isAdmin,
          companyId: userCompaniesData.company_id,
          department: userCompaniesData.department,
          specificPermissions,
          email: profileData?.email || user.user.email || null
        } as UserPermissions;
      } catch (error) {
        console.error("Error in usePermissions:", error);
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
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Se houver erro na consulta principal, usar fallback para super admin
  const finalData = isLoading || error ? {
    userType: fallbackData?.isSuperAdmin ? 'super_admin' as UserType : null,
    isSuperAdmin: fallbackData?.isSuperAdmin || false,
    isContratante: false,
    isOperador: false,
    isAdmin: fallbackData?.isAdmin || false,
    companyId: null,
    department: null,
    specificPermissions: fallbackData?.isSuperAdmin ? { super_admin: true, full_access: true } : {},
    email: fallbackData?.email || null
  } : permissionsData;

  return {
    userType: finalData?.userType || null,
    isSuperAdmin: finalData?.isSuperAdmin || false,
    isContratante: finalData?.isContratante || false,
    isOperador: finalData?.isOperador || false,
    isAdmin: finalData?.isAdmin || false, // Legacy
    companyId: finalData?.companyId || null,
    department: finalData?.department || null,
    specificPermissions: finalData?.specificPermissions || {},
    permissions: finalData?.specificPermissions || {}, // Legacy compatibility
    email: finalData?.email || null,
    isLoading,
    hasFullAccess: finalData?.isSuperAdmin || false, // Legacy compatibility
    
    // Funções de conveniência específicas por hierarquia
    canManageSystem: finalData?.isSuperAdmin || false,
    canManageCompany: (finalData?.isSuperAdmin || finalData?.isContratante) || false,
    canManageUsers: (finalData?.isSuperAdmin || finalData?.isContratante) || false,
    canManagePlans: finalData?.isSuperAdmin || false,
    canAccessAdminPanel: (finalData?.isSuperAdmin || finalData?.isContratante) || false,
    canViewReports: (finalData?.isSuperAdmin || finalData?.isContratante || finalData?.specificPermissions?.reports) || false,
    
    // Verificações por contexto
    canAccessDepartmentData: (companyId: string, department?: string) => {
      if (finalData?.isSuperAdmin) return true;
      if (finalData?.isContratante && finalData?.companyId === companyId) return true;
      if (finalData?.isOperador && finalData?.companyId === companyId) {
        return !department || finalData?.department === department;
      }
      return false;
    },
    
    canManageCompanyData: (companyId: string) => {
      if (finalData?.isSuperAdmin) return true;
      return finalData?.isContratante && finalData?.companyId === companyId;
    }
  };
}