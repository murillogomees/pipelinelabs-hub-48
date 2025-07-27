
import React, { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface PermissionContextProps {
  hasPermission: (permission: string) => boolean;
  canAccess: (permission: string | string[]) => boolean;
  canManageSystem: boolean;
  canManageCompany: boolean;
  canAccessAdminPanel: boolean;
  isSuperAdmin: boolean;
  isContratante: boolean;
  isOperador: boolean;
  userType: string | null;
  canDeleteAnyRecord: boolean;
  canModifyAnyData: boolean;
  canManagePlans: boolean;
}

const PermissionContext = createContext<PermissionContextProps | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const permissions = usePermissions();

  if (permissions.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const canAccess = (permission: string | string[]): boolean => {
    if (permissions.isSuperAdmin) return true;
    
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.hasPermission(p));
    }
    
    return permissions.hasPermission(permission);
  };

  const contextValue: PermissionContextProps = {
    hasPermission: permissions.hasPermission,
    canAccess,
    canManageSystem: permissions.canManageSystem,
    canManageCompany: permissions.canManageCompanyData,
    canAccessAdminPanel: permissions.canAccessAdminPanel,
    isSuperAdmin: permissions.isSuperAdmin,
    isContratante: permissions.isContratante,
    isOperador: permissions.isOperador,
    userType: permissions.userType,
    canDeleteAnyRecord: permissions.canDeleteAnyRecord,
    canModifyAnyData: permissions.canModifyAnyData,
    canManagePlans: permissions.canManagePlans
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
}

// HOC para proteger componentes com base em permissões
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string | string[],
  fallback?: React.ComponentType
) {
  return function PermissionWrappedComponent(props: P) {
    const { canAccess } = usePermissionContext();
    
    if (!canAccess(requiredPermission)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }
      
      return (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Você não tem permissão para acessar este recurso.</p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}
