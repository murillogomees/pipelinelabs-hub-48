
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

  console.log('AuthRedirect - Current location:', location.pathname);
  console.log('AuthRedirect - User:', user ? 'authenticated' : 'not authenticated');
  console.log('AuthRedirect - Loading:', loading);

  // Se está carregando, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Se usuário está autenticado e está na página de auth, redirecionar para dashboard
  if (user && (location.pathname === '/auth' || location.pathname === '/login')) {
    console.log('AuthRedirect - Redirecting authenticated user to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  // Se não está autenticado e não está em /auth, permitir acesso à página de auth
  return <>{children}</>;
};
