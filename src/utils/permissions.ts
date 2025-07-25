/**
 * Utilitários para sistema de permissões
 */

export const PERMISSIONS = {
  // Permissões gerais
  DASHBOARD: 'dashboard',
  
  // Comercial
  VENDAS: 'vendas',
  PRODUTOS: 'produtos',
  CLIENTES: 'clientes',
  COMPRAS: 'compras',
  
  // Financeiro
  FINANCEIRO: 'financeiro',
  
  // Fiscal
  NOTAS_FISCAIS: 'notas_fiscais',
  
  // Operacional
  PRODUCAO: 'producao',
  CONTRATOS: 'contratos',
  ESTOQUE: 'estoque',
  
  // Relatórios e Analytics
  RELATORIOS: 'relatorios',
  ANALYTICS: 'analytics',
  
  // Integrações
  MARKETPLACE_CANAIS: 'marketplace_canais',
  INTEGRACOES: 'integracoes',
  
  // Configurações
  CONFIGURACOES: 'configuracoes',
  
  // Administrativo
  ADMIN_PANEL: 'admin_panel',
  USER_MANAGEMENT: 'user_management',
  COMPANY_MANAGEMENT: 'company_management',
  SYSTEM_SETTINGS: 'system_settings'
} as const;

export const USER_TYPES = {
  SUPER_ADMIN: 'super_admin',
  CONTRATANTE: 'contratante',
  OPERADOR: 'operador'
} as const;

/**
 * Permissões padrão por tipo de usuário
 */
export const DEFAULT_PERMISSIONS = {
  [USER_TYPES.SUPER_ADMIN]: {
    [PERMISSIONS.DASHBOARD]: true,
    [PERMISSIONS.VENDAS]: true,
    [PERMISSIONS.PRODUTOS]: true,
    [PERMISSIONS.CLIENTES]: true,
    [PERMISSIONS.COMPRAS]: true,
    [PERMISSIONS.FINANCEIRO]: true,
    [PERMISSIONS.NOTAS_FISCAIS]: true,
    [PERMISSIONS.PRODUCAO]: true,
    [PERMISSIONS.CONTRATOS]: true,
    [PERMISSIONS.ESTOQUE]: true,
    [PERMISSIONS.RELATORIOS]: true,
    [PERMISSIONS.ANALYTICS]: true,
    [PERMISSIONS.MARKETPLACE_CANAIS]: true,
    [PERMISSIONS.INTEGRACOES]: true,
    [PERMISSIONS.CONFIGURACOES]: true,
    [PERMISSIONS.ADMIN_PANEL]: true,
    [PERMISSIONS.USER_MANAGEMENT]: true,
    [PERMISSIONS.COMPANY_MANAGEMENT]: true,
    [PERMISSIONS.SYSTEM_SETTINGS]: true
  },
  [USER_TYPES.CONTRATANTE]: {
    [PERMISSIONS.DASHBOARD]: true,
    [PERMISSIONS.VENDAS]: true,
    [PERMISSIONS.PRODUTOS]: true,
    [PERMISSIONS.CLIENTES]: true,
    [PERMISSIONS.COMPRAS]: true,
    [PERMISSIONS.FINANCEIRO]: true,
    [PERMISSIONS.NOTAS_FISCAIS]: true,
    [PERMISSIONS.PRODUCAO]: true,
    [PERMISSIONS.CONTRATOS]: true,
    [PERMISSIONS.ESTOQUE]: true,
    [PERMISSIONS.RELATORIOS]: true,
    [PERMISSIONS.ANALYTICS]: true,
    [PERMISSIONS.MARKETPLACE_CANAIS]: true,
    [PERMISSIONS.INTEGRACOES]: true,
    [PERMISSIONS.CONFIGURACOES]: true,
    [PERMISSIONS.USER_MANAGEMENT]: true
  },
  [USER_TYPES.OPERADOR]: {
    [PERMISSIONS.DASHBOARD]: true,
    [PERMISSIONS.VENDAS]: true,
    [PERMISSIONS.PRODUTOS]: true,
    [PERMISSIONS.CLIENTES]: true,
    [PERMISSIONS.COMPRAS]: true,
    [PERMISSIONS.FINANCEIRO]: false,
    [PERMISSIONS.NOTAS_FISCAIS]: false,
    [PERMISSIONS.PRODUCAO]: true,
    [PERMISSIONS.CONTRATOS]: false,
    [PERMISSIONS.ESTOQUE]: true,
    [PERMISSIONS.RELATORIOS]: true,
    [PERMISSIONS.ANALYTICS]: false,
    [PERMISSIONS.MARKETPLACE_CANAIS]: false,
    [PERMISSIONS.INTEGRACOES]: false,
    [PERMISSIONS.CONFIGURACOES]: false
  }
};

/**
 * Valida se um conjunto de permissões está correto
 */
export function validatePermissions(permissions: Record<string, boolean>): boolean {
  const validPermissions = Object.values(PERMISSIONS);
  const permissionKeys = Object.keys(permissions);
  
  return permissionKeys.every(key => validPermissions.includes(key as any));
}

/**
 * Obtém permissões padrão para um tipo de usuário
 */
export function getDefaultPermissionsForUserType(userType: string): Record<string, boolean> {
  return DEFAULT_PERMISSIONS[userType as keyof typeof DEFAULT_PERMISSIONS] || {};
}

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasPermission(
  userPermissions: Record<string, boolean>,
  permission: string,
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) return true;
  return userPermissions[permission] === true;
}