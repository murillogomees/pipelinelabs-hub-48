export interface ConfigField {
  field: string;
  type: 'text' | 'password' | 'email' | 'url' | 'number' | 'boolean';
  label: string;
  required: boolean;
  placeholder?: string;
  description?: string;
}

export interface IntegrationAvailable {
  id: string;
  name: string;
  type: 'logistica' | 'financeiro' | 'api' | 'comunicacao' | 'contabilidade' | 'personalizada';
  description?: string;
  logo_url?: string;
  config_schema: ConfigField[];
  available_for_plans: string[];
  visible_to_companies: boolean;
  is_global_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyIntegration {
  id: string;
  company_id: string;
  integration_id: string;
  is_active: boolean;
  credentials?: Record<string, any>;
  config: Record<string, any>;
  last_tested?: string;
  created_at: string;
  updated_at: string;
  integration_available?: IntegrationAvailable;
}