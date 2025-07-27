
import { useProfile } from './useProfile';

export const usePermissions = () => {
  const { profile, isSuperAdmin, hasPermission, canAccessRoute } = useProfile();

  const isAdmin = isSuperAdmin || hasPermission('admin_panel');
  const isContratante = hasPermission('admin_panel') || hasPermission('empresas');
  const isOperador = !isSuperAdmin && !isAdmin && !!profile?.company_id;

  const canManageUsers = isSuperAdmin || hasPermission('usuarios');
  const canManageCompanies = isSuperAdmin || hasPermission('empresas');
  const canManageSystem = isSuperAdmin || hasPermission('sistema');
  const canManageSecurity = isSuperAdmin || hasPermission('seguranca');

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
    isSuperAdmin,
    isAdmin,
    isContratante,
    isOperador,
    canManageUsers,
    canManageCompanies,
    canManageSystem,
    canManageSecurity,
    hasPermission,
    canAccessRoute,
    canAccess,
  };
};
