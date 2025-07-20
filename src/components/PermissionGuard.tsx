import React from 'react';
import { useRoleChecks } from '@/hooks/useUserRole';
import { AlertTriangle, Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: 'super_admin' | 'contratante' | 'operador';
  requireSystemAdmin?: boolean;
  requireCompanyAdmin?: boolean;
  companyId?: string;
  department?: string;
  customCheck?: () => boolean;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  fallback,
  requiredRole,
  requireSystemAdmin = false,
  requireCompanyAdmin = false,
  companyId,
  department,
  customCheck,
  showFallback = true
}: PermissionGuardProps) {
  const {
    canAccessSystemAdmin,
    canAccessCompanyAdmin,
    canAccessOperationalData
  } = useRoleChecks();

  // Verificação personalizada
  if (customCheck && !customCheck()) {
    return showFallback ? (fallback || <DefaultAccessDenied />) : null;
  }

  // Verificação por nível de sistema
  if (requireSystemAdmin && !canAccessSystemAdmin()) {
    return showFallback ? (fallback || <DefaultAccessDenied />) : null;
  }

  // Verificação por nível de empresa
  if (requireCompanyAdmin && !canAccessCompanyAdmin(companyId)) {
    return showFallback ? (fallback || <DefaultAccessDenied />) : null;
  }

  // Verificação por role específico e contexto
  if (requiredRole) {
    let hasAccess = false;
    
    switch (requiredRole) {
      case 'super_admin':
        hasAccess = canAccessSystemAdmin();
        break;
      case 'contratante':
        hasAccess = canAccessCompanyAdmin(companyId);
        break;
      case 'operador':
        hasAccess = canAccessOperationalData(companyId, department);
        break;
    }

    if (!hasAccess) {
      return showFallback ? (fallback || <DefaultAccessDenied />) : null;
    }
  }

  return <>{children}</>;
}

function DefaultAccessDenied() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Acesso Restrito
        </h3>
        <p className="text-muted-foreground text-sm">
          Você não tem permissão para acessar esta funcionalidade.
        </p>
      </div>
    </div>
  );
}

// Componentes específicos para diferentes tipos de proteção
export function SuperAdminGuard({ children, fallback, showFallback = true }: Omit<PermissionGuardProps, 'requiredRole'>) {
  return (
    <PermissionGuard
      requireSystemAdmin
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function ContratanteGuard({ 
  children, 
  fallback, 
  companyId, 
  showFallback = true 
}: Omit<PermissionGuardProps, 'requiredRole'>) {
  return (
    <PermissionGuard
      requireCompanyAdmin
      companyId={companyId}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function OperadorGuard({ 
  children, 
  fallback, 
  companyId, 
  department, 
  showFallback = true 
}: Omit<PermissionGuardProps, 'requiredRole'>) {
  return (
    <PermissionGuard
      requiredRole="operador"
      companyId={companyId}
      department={department}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGuard>
  );
}