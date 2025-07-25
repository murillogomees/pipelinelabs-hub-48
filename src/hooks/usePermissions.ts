
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
            email: null
          };
        }

        const userEmail = user.user.email || "";
        
        // Check for super admin status from database instead of hardcoded email
        const { data: superAdminCheck } = await supabase
          .from("user_companies")
          .select("user_type")
          .eq("user_id", user.user.id)
          .eq("user_type", "super_admin")
          .eq("is_active", true)
          .maybeSingle();
        
        const isSuperAdminByEmail = !!superAdminCheck;
        
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

        // Buscar dados do usuário com tratamento de erro
        const { data: userCompaniesData, error: companiesError } = await supabase
          .from("user_companies")
          .select("user_type, department, specific_permissions, is_active, company_id, role, permissions")
          .eq("user_id", user.user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (companiesError) {
          console.error("Error fetching user companies:", companiesError);
          
          // Se der erro mas é super admin, retornar permissões
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
        const permissions = (userCompaniesData.permissions as Record<string, any>) || {};
        
        // Combinar permissões específicas e gerais
        const allPermissions = { ...permissions, ...specificPermissions };
        
        const isSuperAdmin = userType === 'super_admin' || isSuperAdminByEmail || allPermissions.super_admin === true;
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
          specificPermissions: isSuperAdminByEmail ? { ...allPermissions, super_admin: true, full_access: true } : allPermissions,
          email: userEmail
        } as UserPermissions;
      } catch (error) {
        console.error("Error in usePermissions:", error);
        
        // Verificar se é super admin pelo email mesmo com erro
        try {
          const { data: user } = await supabase.auth.getUser();
          const userEmail = user.user?.email || "";
          
          // Check for super admin status from database
          const { data: superAdminCheck } = await supabase
            .from("user_companies")
            .select("user_type")
            .eq("user_id", user.user.id)
            .eq("user_type", "super_admin")
            .eq("is_active", true)
            .maybeSingle();
          
          const isSuperAdminByEmail = !!superAdminCheck;
          
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
        } catch (fallbackError) {
          console.error("Fallback error in usePermissions:", fallbackError);
          throw error;
        }
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Não tentar novamente para erros de autenticação
      if (error?.message?.includes('JWT')) return false;
      return failureCount < 2;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
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
    isLoading,
    hasFullAccess: permissionsData?.isSuperAdmin || false,
    
    // Funções de conveniência específicas por hierarquia - Super Admin pode TUDO
    canManageSystem: permissionsData?.isSuperAdmin || false,
    canManageCompany: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canManageUsers: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canManagePlans: permissionsData?.isSuperAdmin || false,
    canAccessAdminPanel: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canViewReports: permissionsData?.isSuperAdmin || permissionsData?.isContratante || permissionsData?.specificPermissions?.reports || false,
    
    // Super Admin bypass - sempre retorna true para super admin
    canBypassAllRestrictions: permissionsData?.isSuperAdmin || false,
    canAccessAnyCompany: permissionsData?.isSuperAdmin || false,
    canModifyAnyData: permissionsData?.isSuperAdmin || false,
    canDeleteAnyRecord: permissionsData?.isSuperAdmin || false,
    
    // Verificações específicas de permissão por funcionalidade
    hasPermission: (permission: string) => {
      // Super Admin tem todas as permissões
      if (permissionsData?.isSuperAdmin) return true;
      return permissionsData?.specificPermissions?.[permission] === true;
    },
    
    // Verificações por contexto
    canAccessDepartmentData: (companyId: string, department?: string) => {
      // Super Admin pode acessar qualquer departamento de qualquer empresa
      if (permissionsData?.isSuperAdmin) return true;
      if (permissionsData?.isContratante && permissionsData?.companyId === companyId) return true;
      if (permissionsData?.isOperador && permissionsData?.companyId === companyId) {
        return !department || permissionsData?.department === department;
      }
      return false;
    },
    
    canManageCompanyData: (companyId: string) => {
      // Super Admin pode gerenciar qualquer empresa
      if (permissionsData?.isSuperAdmin) return true;
      return permissionsData?.isContratante && permissionsData?.companyId === companyId;
    },

    // Verificar se pode acessar qualquer rota/página
    canAccessRoute: (route: string) => {
      // Super Admin pode acessar qualquer rota
      if (permissionsData?.isSuperAdmin) return true;
      
      // Rotas administrativas só para super admin e contratante
      const adminRoutes = ['/app/admin', '/app/configuracoes'];
      if (adminRoutes.some(adminRoute => route.startsWith(adminRoute))) {
        return permissionsData?.isContratante || false;
      }
      
      return true; // Outras rotas são acessíveis para usuários autenticados
    },

    error
  };
}
