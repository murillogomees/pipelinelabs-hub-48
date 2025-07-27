
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  requireSuperAdmin?: boolean;
  requireContratante?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  fallback,
  requireSuperAdmin = false,
  requireContratante = false
}) => {
  const permissions = usePermissions();

  if (permissions.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check super admin requirement
  if (requireSuperAdmin && !permissions.isSuperAdmin) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Acesso restrito. Você precisa ser um Super Admin para visualizar este conteúdo.
        </AlertDescription>
      </Alert>
    );
  }

  // Check contratante requirement
  if (requireContratante && !permissions.isContratante && !permissions.isSuperAdmin) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Acesso restrito. Você precisa ser um Contratante para visualizar este conteúdo.
        </AlertDescription>
      </Alert>
    );
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => permissions.hasPermission(permission))
      : requiredPermissions.some(permission => permissions.hasPermission(permission));

    if (!hasRequiredPermissions) {
      return fallback || (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para visualizar este conteúdo.
          </AlertDescription>
        </Alert>
      );
    }
  }

  return <>{children}</>;
};

export const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PermissionGuard requireSuperAdmin>
      {children}
    </PermissionGuard>
  );
};
