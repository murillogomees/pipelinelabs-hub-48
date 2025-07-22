
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Mostrar loading durante verificação de autenticação
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
    return <Navigate to="/auth" replace />;
  }

  // Se não estiver autenticado, redirecionar para auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Se estiver autenticado, renderizar children
  return <>{children}</>;
}
