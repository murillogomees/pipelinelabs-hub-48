
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';
import { PERMISSIONS } from '@/utils/permissions';

export interface UserPermissions {
  // Basic permissions
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  
  // Company info
  currentCompanyId: string | null;
  
  // Specific permissions
  permissions: Record<string, boolean>;
  
  // Access checks
  canAccessCompanyData: boolean;
  canManageCompanyData: boolean;
  canAccessAdminPanel: boolean;
  canManageSystem: boolean;
  canManageUsers: boolean;
  canAccessDepartmentData: boolean;
  canBypassAllRestrictions: boolean;
  canDeleteAnyRecord: boolean;
  canModifyAnyData: boolean;
  canManagePlans: boolean;
  
  // Utility function
  hasPermission: (permission: string) => boolean;
}

export function usePermissions(): UserPermissions {
  const { user } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          access_levels (
            name,
            display_name,
            permissions
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  const { data: currentCompany } = useQuery({
    queryKey: ['current-company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching company:', error);
        return null;
      }

      return data;
    }
  });

  // Extract permissions from access level
  const accessLevel = userProfile?.access_levels;
  const accessLevelName = accessLevel?.name || 'operador';
  const accessLevelPermissions = accessLevel?.permissions || {};

  // Role checks
  const isSuperAdmin = accessLevelName === 'super_admin';
  const isContratante = accessLevelName === 'contratante';
  const isOperador = accessLevelName === 'operador';

  // Company ID
  const currentCompanyId = currentCompany?.id || null;

  // Permission checks
  const permissions = typeof accessLevelPermissions === 'object' ? accessLevelPermissions : {};

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions[permission] === true;
  };

  // Access control
  const canAccessCompanyData = isSuperAdmin || isContratante || isOperador;
  const canManageCompanyData = isSuperAdmin || isContratante;
  const canAccessAdminPanel = isSuperAdmin;
  const canManageSystem = isSuperAdmin;
  const canManageUsers = isSuperAdmin || isContratante;
  const canAccessDepartmentData = isSuperAdmin || isContratante;
  const canBypassAllRestrictions = isSuperAdmin;
  const canDeleteAnyRecord = isSuperAdmin || isContratante;
  const canModifyAnyData = isSuperAdmin || isContratante;
  const canManagePlans = isSuperAdmin;

  return {
    isSuperAdmin,
    isContratante,
    isOperador,
    currentCompanyId,
    permissions,
    canAccessCompanyData,
    canManageCompanyData,
    canAccessAdminPanel,
    canManageSystem,
    canManageUsers,
    canAccessDepartmentData,
    canBypassAllRestrictions,
    canDeleteAnyRecord,
    canModifyAnyData,
    canManagePlans,
    hasPermission
  };
}
