import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Se está carregando, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Se usuário está autenticado e tentando acessar /auth, redirecionar para dashboard
  if (user && location.pathname === '/auth') {
    // Pegar o redirecionamento original se existir, senão ir para dashboard
    const from = location.state?.from?.pathname || '/app/dashboard';
    return <Navigate to={from} replace />;
  }

  // Se não está autenticado, mostrar a página de auth normalmente
  return <>{children}</>;
};