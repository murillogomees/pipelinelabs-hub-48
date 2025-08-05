
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/Auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireSuperAdmin = false
}) => {
  const { user, isLoading } = useAuth();
  const { isSuperAdmin, isAdmin, isLoading: permissionsLoading } = usePermissions();

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (requireAdmin && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
