export interface ConfigField {
  field: string;
  type: string;
  label: string;
  required: boolean;
}

export interface IntegrationAvailable {
  id: string;
  name: string;
  type: string;
  description: string | null;
  logo_url?: string | null;
  config_schema: any;
  visible_to_companies: boolean;
  available_for_plans: string[] | null;
  created_at: string;
}

export type IntegrationType = 
  | 'marketplace' 
  | 'logistica' 
  | 'financeiro' 
  | 'api' 
  | 'comunicacao' 
  | 'contabilidade' 
  | 'personalizada';

export const INTEGRATION_TYPES: Record<IntegrationType, string> = {
  marketplace: 'Marketplace',
  logistica: 'Logística',
  financeiro: 'Financeiro',
  api: 'API',
  comunicacao: 'Comunicação',
  contabilidade: 'Contabilidade',
  personalizada: 'Personalizada'
};

export const INTEGRATION_TYPE_COLORS: Record<IntegrationType, string> = {
  marketplace: 'bg-blue-100 text-blue-800',
  logistica: 'bg-green-100 text-green-800',
  financeiro: 'bg-yellow-100 text-yellow-800',
  api: 'bg-purple-100 text-purple-800',
  comunicacao: 'bg-pink-100 text-pink-800',
  contabilidade: 'bg-indigo-100 text-indigo-800',
  personalizada: 'bg-gray-100 text-gray-800'
};