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
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
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