
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';
import { PERMISSIONS } from '@/utils/permissions';

export interface UserPermissions {
  // Basic permissions
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  isAdmin: boolean; // Alias for isSuperAdmin
  
  // Loading state
  isLoading: boolean;
  
  // Company info
  currentCompanyId: string | null;
  companyId: string | null; // Alias for currentCompanyId
  
  // User info
  email: string | null;
  userType: string | null;
  
  // Specific permissions
  permissions: Record<string, boolean>;
  
  // Access checks
  canAccessCompanyData: boolean;
  canManageCompanyData: boolean;
  canManageCompany: boolean; // Alias for canManageCompanyData
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

  const { data: userProfile, isLoading: profileLoading } = useQuery({
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

  const { data: currentCompany, isLoading: companyLoading } = useQuery({
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

  const isLoading = profileLoading || companyLoading;

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

  // User info
  const email = userProfile?.email || null;
  const userType = accessLevelName;

  // Permission checks - safely handle permissions
  const permissions: Record<string, boolean> = {};
  if (accessLevelPermissions && typeof accessLevelPermissions === 'object') {
    Object.keys(accessLevelPermissions).forEach(key => {
      const value = accessLevelPermissions[key];
      permissions[key] = value === true;
    });
  }

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
    isAdmin: isSuperAdmin,
    isLoading,
    currentCompanyId,
    companyId: currentCompanyId,
    email,
    userType,
    permissions,
    canAccessCompanyData,
    canManageCompanyData,
    canManageCompany: canManageCompanyData,
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
