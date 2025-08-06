
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const usePermissions = () => {
  const { user } = useAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Buscar permissões do usuário fazendo queries manuais
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Buscar access level
      const { data: accessLevel, error: accessError } = await supabase
        .from('access_levels')
        .select('*')
        .eq('id', profileData.access_level_id)
        .single();

      if (accessError || !accessLevel) {
        console.error('Error fetching access level:', accessError);
        return null;
      }

      // Buscar company association
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      return {
        isSuperAdmin: accessLevel.name === 'super_admin',
        isAdmin: ['contratante', 'super_admin'].includes(accessLevel.name),
        canAccessAdmin: ['super_admin', 'contratante'].includes(accessLevel.name),
        currentCompanyId: userCompany?.company_id || null,
        isContratante: accessLevel.name === 'contratante',
        canDeleteAnyRecord: accessLevel.name === 'super_admin',
        canModifyAnyData: accessLevel.name === 'super_admin',
        canManagePlans: ['super_admin', 'contratante'].includes(accessLevel.name),
        permissions: accessLevel.permissions || {},
        userRole: userCompany?.role || 'operador'
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: false
  });

  const hasPermission = (permission: string) => {
    if (!permissions?.permissions) return false;
    return permissions.permissions[permission] === true;
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
