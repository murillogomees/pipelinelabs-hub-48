
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
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
  const { isAuthenticated, isLoading: authLoading, error } = useAuth();
  const { 
    profile,
    isLoading: profileLoading,
    isSuperAdmin,
    needsSubscriptionRedirect,
    canAccessRoute
  } = useProfile();
  const location = useLocation();

  const isLoading = authLoading || profileLoading;

  // Log para debug
  React.useEffect(() => {
    if (!isLoading && profile) {
      console.log('ProtectedRoute Debug:', {
        email: profile.email,
        isSuperAdmin,
        requireSuperAdmin,
        requireAdmin,
        path: location.pathname,
        hasActiveCompany: !!profile.company_id,
        hasActiveSubscription: !!profile.stripe_customer_id
      });
    }
  }, [profile, isSuperAdmin, requireSuperAdmin, requireAdmin, location.pathname, isLoading]);

  // Mostrar loading durante verificação
  if (isLoading) {
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

  // Se não houver profile, redirecionar para auth
  if (!profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Super Admin pode bypassar todas as restrições
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Verificar se precisa de assinatura ativa
  if (needsSubscriptionRedirect()) {
    return <Navigate to="/app/subscription" replace />;
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

  if (requireAdmin && !canAccessRoute('/app/admin')) {
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

  // Verificar se pode acessar a rota atual
  if (!canAccessRoute(location.pathname)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
