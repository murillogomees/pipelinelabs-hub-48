
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Se está carregando, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Se usuário está autenticado e tentando acessar /auth, redirecionar para dashboard
  if (user && location.pathname === '/auth') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Se não está autenticado e não está em /auth, permitir acesso
  return <>{children}</>;
};
