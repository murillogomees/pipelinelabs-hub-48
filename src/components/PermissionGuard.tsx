
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallback
}) => {
  const { 
    hasPermission, 
    hasRole, 
    isLoading, 
    isContratante,
    isAdmin,
    canManageCompanyData
  } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role-based permissions
  if (requiredRole) {
    const roleCheck = () => {
      switch (requiredRole) {
        case 'admin':
          return isAdmin;
        case 'contratante':
          return isContratante;
        case 'manager':
          return canManageCompanyData;
        default:
          return hasRole(requiredRole);
      }
    };

    if (!roleCheck()) {
      return fallback || (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta funcionalidade. Função necessária: {requiredRole}
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasRequiredPermissions) {
      return fallback || (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você não tem as permissões necessárias para acessar esta funcionalidade.
          </AlertDescription>
        </Alert>
      );
    }
  }

  return <>{children}</>;
};
