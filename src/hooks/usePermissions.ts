
import { useProfile } from './useProfile';
import { useCurrentCompany } from './useCurrentCompany';

export const usePermissions = () => {
  const profileData = useProfile();
  const { data: currentCompany } = useCurrentCompany();

  const { profile, isLoading, error, isSuperAdmin, hasPermission, canAccessRoute } = profileData;

  const isAdmin = isSuperAdmin || hasPermission('admin_panel');
  const isContratante = hasPermission('admin_panel') || hasPermission('empresas');
  const isOperador = !isSuperAdmin && !isAdmin && !!profile?.company_id;

  const canManageUsers = isSuperAdmin || hasPermission('usuarios');
  const canManageCompanies = isSuperAdmin || hasPermission('empresas');
  const canManageSystem = isSuperAdmin || hasPermission('sistema');
  const canManageSecurity = isSuperAdmin || hasPermission('seguranca');
  const canManagePlans = isSuperAdmin || hasPermission('planos');
  const canDeleteAnyRecord = isSuperAdmin || isContratante;
  const canModifyAnyData = isSuperAdmin || isContratante;
  const canManageCompany = isSuperAdmin || isContratante;
  const canManageCompanyData = isSuperAdmin || isContratante;
  const canAccessAdminPanel = isSuperAdmin || hasPermission('admin_panel');

  const currentCompanyId = currentCompany?.company_id || profile?.company_id;
  const userType = isSuperAdmin ? 'super_admin' : (isContratante ? 'contratante' : 'operador');

  const canAccess = {
    dashboard: hasPermission('dashboard'),
    vendas: hasPermission('vendas'),
    produtos: hasPermission('produtos'),
    clientes: hasPermission('clientes'),
    fornecedores: hasPermission('fornecedores'),
    estoque: hasPermission('estoque'),
    financeiro: hasPermission('financeiro'),
    relatorios: hasPermission('relatorios'),
    configuracoes: hasPermission('configuracoes'),
    admin: hasPermission('admin_panel'),
    usuarios: hasPermission('usuarios'),
    empresas: hasPermission('empresas'),
    sistema: hasPermission('sistema'),
    seguranca: hasPermission('seguranca'),
    notas_fiscais: hasPermission('notas_fiscais'),
    contratos: hasPermission('contratos'),
    producao: hasPermission('producao'),
    compras: hasPermission('compras'),
    integracoes: hasPermission('integracoes'),
  };

  return {
    profile,
    isLoading,
    error,
    isSuperAdmin,
    isAdmin,
    isContratante,
    isOperador,
    canManageUsers,
    canManageCompanies,
    canManageSystem,
    canManageSecurity,
    canManagePlans,
    canDeleteAnyRecord,
    canModifyAnyData,
    canManageCompany,
    canManageCompanyData,
    canAccessAdminPanel,
    currentCompanyId,
    userType,
    hasPermission,
    canAccessRoute,
    canAccess,
  };
};
