export interface UserFormData {
  display_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  user_type: 'contratante' | 'operador';
  password: string;
  company_id: string;
  permissions: {
    dashboard: boolean;
    vendas: boolean;
    produtos: boolean;
    clientes: boolean;
    financeiro: boolean;
    notas_fiscais: boolean;
    producao: boolean;
    contratos: boolean;
  };
}

export interface Company {
  id: string;
  name: string;
}

export interface User {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  user_companies: Array<{
    id: string;
    user_type: 'contratante' | 'operador';
    company_id: string;
    permissions: Record<string, boolean>;
  }>;
}