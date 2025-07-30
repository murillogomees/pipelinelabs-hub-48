
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './Auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { LoadingSpinner } from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const { isSuperAdmin, isAdmin } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
