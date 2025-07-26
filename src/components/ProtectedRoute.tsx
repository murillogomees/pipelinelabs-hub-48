
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/Auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireSuperAdmin = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, error } = useAuth();
  const { 
    isSuperAdmin, 
    isAdmin, 
    isLoading: permissionsLoading,
    canBypassAllRestrictions 
  } = usePermissions();
  const location = useLocation();

  // Mostrar loading durante verificação de autenticação
  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // Se houver erro e não estiver autenticado, redirecionar para auth
  if (error && !isAuthenticated) {
    console.error('Auth error:', error);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se não estiver autenticado, redirecionar para auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Super Admin pode bypassar todas as restrições
  if (canBypassAllRestrictions) {
    return <>{children}</>;
  }

  // Verificar permissões específicas
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Acesso Restrito
          </h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área administrativa.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Entre em contato com um administrador do sistema.
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Acesso Restrito
          </h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  // Se estiver autenticado e tiver as permissões necessárias, renderizar children
  return <>{children}</>;
}
