
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserPermissions {
  userType: string | null;
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  isAdmin: boolean;
  permissions: Record<string, boolean>;
  accessLevel: {
    id: string;
    name: string;
    display_name: string;
    permissions: Record<string, boolean>;
  } | null;
  email: string | null;
  isLoading: boolean;
  error: any;
}

export function usePermissions(): UserPermissions {
  const { data: permissionsData, isLoading, error } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user.user) {
          return {
            userType: null,
            isSuperAdmin: false,
            isContratante: false,
            isOperador: false,
            isAdmin: false,
            permissions: {},
            accessLevel: null,
            email: null
          };
        }

        const userEmail = user.user.email || "";
        
        // Acesso temporário para murilloggomes@gmail.com
        if (userEmail === 'murilloggomes@gmail.com') {
          return {
            userType: 'super_admin',
            isSuperAdmin: true,
            isContratante: true,
            isOperador: false,
            isAdmin: true,
            permissions: {
              dashboard: true,
              vendas: true,
              produtos: true,
              clientes: true,
              compras: true,
              estoque: true,
              financeiro: true,
              notas_fiscais: true,
              producao: true,
              contratos: true,
              relatorios: true,
              analytics: true,
              marketplace_canais: true,
              integracoes: true,
              configuracoes: true,
              admin_panel: true,
              user_management: true,
              company_management: true,
              system_settings: true
            },
            accessLevel: {
              id: 'temp-super-admin',
              name: 'super_admin',
              display_name: 'Super Administrador',
              permissions: {
                dashboard: true,
                vendas: true,
                produtos: true,
                clientes: true,
                compras: true,
                estoque: true,
                financeiro: true,
                notas_fiscais: true,
                producao: true,
                contratos: true,
                relatorios: true,
                analytics: true,
                marketplace_canais: true,
                integracoes: true,
                configuracoes: true,
                admin_panel: true,
                user_management: true,
                company_management: true,
                system_settings: true
              }
            },
            email: userEmail
          };
        }
        
        // Buscar dados do perfil do usuário com access_level
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(`
            *,
            access_levels (
              id,
              name,
              display_name,
              permissions
            )
          `)
          .eq("user_id", user.user.id)
          .eq("is_active", true)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching user profile:", profileError);
          return {
            userType: null,
            isSuperAdmin: false,
            isContratante: false,
            isOperador: false,
            isAdmin: false,
            permissions: {},
            accessLevel: null,
            email: userEmail
          };
        }

        const accessLevel = profile.access_levels;
        const permissions = accessLevel?.permissions || {};
        const userType = accessLevel?.name || null;
        
        const isSuperAdmin = userType === 'super_admin';
        const isContratante = userType === 'contratante';
        const isOperador = userType === 'operador';
        const isAdmin = isSuperAdmin || isContratante;

        return {
          userType,
          isSuperAdmin,
          isContratante,
          isOperador,
          isAdmin,
          permissions,
          accessLevel,
          email: userEmail
        };
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
    permissions: permissionsData?.permissions || {},
    accessLevel: permissionsData?.accessLevel || null,
    email: permissionsData?.email || null,
    isLoading,
    error,
    
    // Funções de conveniência
    hasPermission: (permission: string) => {
      if (permissionsData?.isSuperAdmin) return true;
      return permissionsData?.permissions?.[permission] === true;
    },
    
    canManageSystem: permissionsData?.isSuperAdmin || false,
    canManageCompany: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canAccessAdminPanel: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    
    hasFullAccess: permissionsData?.isSuperAdmin || false,
    canManageUsers: permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canAccessDepartmentData: () => true, // Simplificado para nova estrutura
    canManageCompanyData: () => permissionsData?.isSuperAdmin || permissionsData?.isContratante || false,
    canAccessRoute: () => true, // Simplificado para nova estrutura
    canBypassAllRestrictions: permissionsData?.isSuperAdmin || false
  };
}
