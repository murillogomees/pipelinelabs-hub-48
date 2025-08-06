
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/Auth/AuthProvider';

export const usePermissions = () => {
  const { user } = useAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Mock permissions
      return {
        isSuperAdmin: false,
        isAdmin: true,
        canAccessAdmin: true,
        currentCompanyId: '71f946e6-dfbe-4684-a833-6050abb29926',
        isContratante: true,
        canDeleteAnyRecord: true,
        canModifyAnyData: true,
        canManagePlans: true
      };
    },
    enabled: !!user?.id
  });

  const hasPermission = (permission: string) => {
    // Mock permission check - always return true for now
    return true;
  };

  return {
    isSuperAdmin: permissions?.isSuperAdmin || false,
    isAdmin: permissions?.isAdmin || false,
    canAccessAdmin: permissions?.canAccessAdmin || false,
    currentCompanyId: permissions?.currentCompanyId || '',
    isContratante: permissions?.isContratante || false,
    canDeleteAnyRecord: permissions?.canDeleteAnyRecord || false,
    canModifyAnyData: permissions?.canModifyAnyData || false,
    canManagePlans: permissions?.canManagePlans || false,
    hasPermission,
    isLoading
  };
};
