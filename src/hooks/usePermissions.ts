
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
        currentCompanyId: '71f946e6-dfbe-4684-a833-6050abb29926'
      };
    },
    enabled: !!user?.id
  });

  return {
    isSuperAdmin: permissions?.isSuperAdmin || false,
    isAdmin: permissions?.isAdmin || false,
    canAccessAdmin: permissions?.canAccessAdmin || false,
    currentCompanyId: permissions?.currentCompanyId || null,
    isLoading
  };
};
