
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Permissions');

// Fallback permissions when database is unavailable
const FALLBACK_PERMISSIONS = {
  isSuperAdmin: false,
  isAdmin: true, // Give basic admin access as fallback
  canAccessAdmin: true,
  currentCompanyId: null,
  isContratante: true,
  canDeleteAnyRecord: false,
  canModifyAnyData: false,
  canManagePlans: true,
  permissions: {
    dashboard: true,
    vendas: true,
    produtos: true,
    clientes: true,
    compras: true,
    financeiro: true,
    notas_fiscais: true,
    producao: true,
    contratos: true,
    estoque: true,
    relatorios: true,
    analytics: false,
    marketplace_canais: false,
    integracoes: false,
    configuracoes: true
  },
  userRole: 'contratante',
  accessLevelName: 'contratante'
};

export const usePermissions = () => {
  const { user } = useAuth();

  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      logger.info('🔄 Fetching permissions for user:', user.id);
      
      try {
        // Try to fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (profileError) {
          logger.error('Error fetching profile:', profileError);
          
          // If infrastructure error, throw to trigger fallback
          if (profileError.code === 'PGRST002') {
            throw new Error('Infrastructure error - using fallback permissions');
          }
          
          // For other errors, return fallback
          return FALLBACK_PERMISSIONS;
        }

        if (!profileData) {
          logger.warn('No profile found, using fallback permissions');
          return FALLBACK_PERMISSIONS;
        }

        // Try to fetch access level
        const { data: accessLevel, error: accessError } = await supabase
          .from('access_levels')
          .select('*')
          .eq('id', profileData.access_level_id)
          .maybeSingle();

        if (accessError || !accessLevel) {
          logger.warn('Error fetching access level or not found, using profile-based permissions');
          
          // Create permissions based on profile data if available
          const isAdmin = profileData.is_admin || false;
          return {
            isSuperAdmin: isAdmin,
            isAdmin,
            canAccessAdmin: isAdmin,
            currentCompanyId: profileData.company_id,
            isContratante: isAdmin,
            canDeleteAnyRecord: isAdmin,
            canModifyAnyData: isAdmin,
            canManagePlans: isAdmin,
            permissions: isAdmin ? {
              dashboard: true,
              vendas: true,
              produtos: true,
              clientes: true,
              compras: true,
              financeiro: true,
              notas_fiscais: true,
              producao: true,
              contratos: true,
              estoque: true,
              relatorios: true,
              analytics: true,
              marketplace_canais: true,
              integracoes: true,
              configuracoes: true
            } : FALLBACK_PERMISSIONS.permissions,
            userRole: isAdmin ? 'contratante' : 'operador',
            accessLevelName: isAdmin ? 'contratante' : 'operador'
          };
        }

        // Try to get company association
        const { data: userCompany } = await supabase
          .from('user_companies')
          .select('company_id, role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        const result = {
          isSuperAdmin: accessLevel.name === 'super_admin',
          isAdmin: ['contratante', 'super_admin'].includes(accessLevel.name),
          canAccessAdmin: ['super_admin', 'contratante'].includes(accessLevel.name),
          currentCompanyId: userCompany?.company_id || profileData.company_id || null,
          isContratante: accessLevel.name === 'contratante',
          canDeleteAnyRecord: accessLevel.name === 'super_admin',
          canModifyAnyData: accessLevel.name === 'super_admin',
          canManagePlans: ['super_admin', 'contratante'].includes(accessLevel.name),
          permissions: accessLevel.permissions || FALLBACK_PERMISSIONS.permissions,
          userRole: userCompany?.role || accessLevel.name,
          accessLevelName: accessLevel.name
        };
        
        logger.info('✅ Permissions loaded:', result);
        return result;
      } catch (error) {
        logger.error('Error in permissions query, using fallback:', error);
        return FALLBACK_PERMISSIONS;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: false, // Don't retry, use fallback instead
    refetchOnWindowFocus: false,
    refetchOnMount: false
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
    isLoading: isLoading && !error // Don't show loading if there's an error
  };
};
