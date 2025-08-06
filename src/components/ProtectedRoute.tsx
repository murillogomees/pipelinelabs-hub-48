
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, loading } = useAuth();
  const { isSuperAdmin, isAdmin, isLoading: permissionsLoading } = usePermissions();

  // Show loading while auth or permissions are loading
  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If super admin access required but user is not super admin
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // If admin access required but user is not admin or super admin
  if (requireAdmin && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};
