
import { useProfile } from './useProfile';
import { PERMISSIONS } from '@/utils/permissions';

export interface UserPermissions {
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  currentCompanyId: string | null;
  companyId: string | null;
  email: string | null;
  userType: string | null;
  permissions: Record<string, boolean>;
  canAccessCompanyData: boolean;
  canManageCompanyData: boolean;
  canManageCompany: boolean;
  canAccessAdminPanel: boolean;
  canManageSystem: boolean;
  canManageUsers: boolean;
  canAccessDepartmentData: boolean;
  canBypassAllRestrictions: boolean;
  canDeleteAnyRecord: boolean;
  canModifyAnyData: boolean;
  canManagePlans: boolean;
  hasPermission: (permission: string) => boolean;
}

export function usePermissions(): UserPermissions {
  const { profile, isLoading, isSuperAdmin, hasPermission } = useProfile();

  const accessLevel = profile?.access_levels;
  const accessLevelName = accessLevel?.name || 'operador';
  const accessLevelPermissions = accessLevel?.permissions || {};

  // Role checks baseados no access level
  const isContratante = accessLevelName === 'contratante';
  const isOperador = accessLevelName === 'operador';

  // Company ID
  const currentCompanyId = profile?.company_id || null;

  // User info
  const email = profile?.email || null;
  const userType = accessLevelName;

  // Permission checks
  const permissions: Record<string, boolean> = {};
  Object.keys(accessLevelPermissions).forEach(key => {
    permissions[key] = accessLevelPermissions[key] === true;
  });

  // Access control baseado no novo sistema
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
