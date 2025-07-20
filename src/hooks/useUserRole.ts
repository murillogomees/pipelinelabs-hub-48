import { usePermissions } from './usePermissions';

export type UserType = 'super_admin' | 'contratante' | 'operador';

export interface UserRole {
  userType: UserType | null;
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  companyId: string | null;
  department: string | null;
  isLoading: boolean;
}

export function useUserRole(): UserRole {
  const {
    userType,
    isSuperAdmin,
    isContratante,
    isOperador,
    companyId,
    department,
    isLoading
  } = usePermissions();

  return {
    userType,
    isSuperAdmin,
    isContratante,
    isOperador,
    companyId,
    department,
    isLoading
  };
}

// Funções de conveniência para verificação de acesso
export function useRoleChecks() {
  const {
    isSuperAdmin,
    isContratante,
    isOperador,
    companyId,
    department,
    canManageSystem,
    canManageCompany,
    canManageUsers,
    canAccessAdminPanel,
    canAccessDepartmentData,
    canManageCompanyData
  } = usePermissions();

  return {
    // Verificações básicas
    canAccessSystemAdmin: () => isSuperAdmin,
    canAccessCompanyAdmin: (targetCompanyId?: string) => {
      if (isSuperAdmin) return true;
      if (!targetCompanyId) return isContratante;
      return isContratante && companyId === targetCompanyId;
    },
    canAccessOperationalData: (targetCompanyId?: string, targetDepartment?: string) => {
      if (isSuperAdmin) return true;
      if (isContratante && (!targetCompanyId || companyId === targetCompanyId)) return true;
      if (isOperador && (!targetCompanyId || companyId === targetCompanyId)) {
        return !targetDepartment || department === targetDepartment;
      }
      return false;
    },

    // Verificações de funcionalidades específicas
    canManageTeam: (targetCompanyId?: string) => {
      if (isSuperAdmin) return true;
      return isContratante && (!targetCompanyId || companyId === targetCompanyId);
    },
    canEditCompanySettings: (targetCompanyId?: string) => {
      if (isSuperAdmin) return true;
      return isContratante && (!targetCompanyId || companyId === targetCompanyId);
    },
    canViewFinancialReports: (targetCompanyId?: string) => {
      if (isSuperAdmin) return true;
      return isContratante && (!targetCompanyId || companyId === targetCompanyId);
    },
    canManageProducts: (targetCompanyId?: string) => {
      if (isSuperAdmin) return true;
      if (isContratante && (!targetCompanyId || companyId === targetCompanyId)) return true;
      return isOperador && (!targetCompanyId || companyId === targetCompanyId);
    },
    canManageCustomers: (targetCompanyId?: string) => {
      if (isSuperAdmin) return true;
      if (isContratante && (!targetCompanyId || companyId === targetCompanyId)) return true;
      return isOperador && (!targetCompanyId || companyId === targetCompanyId);
    },

    // Verificações herdadas
    canManageSystem,
    canManageCompany,
    canManageUsers,
    canAccessAdminPanel,
    canAccessDepartmentData,
    canManageCompanyData
  };
}