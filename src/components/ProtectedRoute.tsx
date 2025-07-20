import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleChecks } from '@/hooks/useUserRole';
import { AlertTriangle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // Legacy compatibility
  requireSuperAdmin?: boolean;
  requireContratante?: boolean;
  requireOperador?: boolean;
  companyId?: string;
  department?: string;
  customCheck?: () => boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireSuperAdmin = false,
  requireContratante = false,
  requireOperador = false,
  companyId,
  department,
  customCheck,
  redirectTo
}: ProtectedRouteProps) {
  const { loading } = useAuth();
  const {
    canAccessSystemAdmin,
    canAccessCompanyAdmin,
    canAccessOperationalData
  } = useRoleChecks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Verificação personalizada
  if (customCheck && !customCheck()) {
    return <AccessDeniedMessage type="custom" />;
  }

  // Verificação de super admin
  if (requireSuperAdmin && !canAccessSystemAdmin()) {
    return <AccessDeniedMessage type="super_admin" />;
  }

  // Verificação de contratante
  if (requireContratante && !canAccessCompanyAdmin(companyId)) {
    return <AccessDeniedMessage type="contratante" />;
  }

  // Verificação de operador
  if (requireOperador && !canAccessOperationalData(companyId, department)) {
    return <AccessDeniedMessage type="operador" />;
  }

  // Legacy: verificação de admin (mantém compatibilidade)
  if (requireAdmin && !canAccessCompanyAdmin(companyId)) {
    return <AccessDeniedMessage type="admin" />;
  }

  return <>{children}</>;
}

interface AccessDeniedMessageProps {
  type: 'super_admin' | 'contratante' | 'operador' | 'admin' | 'custom';
}

function AccessDeniedMessage({ type }: AccessDeniedMessageProps) {
  const messages = {
    super_admin: {
      title: 'Acesso Restrito - Super Administrador',
      description: 'Apenas super administradores podem acessar esta funcionalidade.'
    },
    contratante: {
      title: 'Acesso Restrito - Contratante',
      description: 'Apenas contratantes podem acessar esta funcionalidade.'
    },
    operador: {
      title: 'Acesso Restrito - Operador',
      description: 'Você não tem permissão para acessar esta área.'
    },
    admin: {
      title: 'Acesso Negado',
      description: 'Apenas administradores podem acessar esta funcionalidade.'
    },
    custom: {
      title: 'Acesso Negado',
      description: 'Você não tem permissão para acessar esta funcionalidade.'
    }
  };

  const message = messages[type];

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {message.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {message.description}
        </p>
      </div>
    </div>
  );
}