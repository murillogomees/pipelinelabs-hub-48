export const getTypeColor = (type: string) => {
  const colors = {
    marketplace: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    logistica: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    financeiro: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    api: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    comunicacao: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    contabilidade: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    personalizada: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  };
  return colors[type as keyof typeof colors] || colors.personalizada;
};

export const getTypeLabel = (type: string) => {
  const labels = {
    marketplace: 'Marketplace',
    logistica: 'Logística',
    financeiro: 'Financeiro',
    api: 'API',
    comunicacao: 'Comunicação',
    contabilidade: 'Contabilidade',
    personalizada: 'Personalizada'
  };
  return labels[type as keyof typeof labels] || 'Outro';
};

export const typeOptions = [
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'logistica', label: 'Logística' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'api', label: 'API' },
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'contabilidade', label: 'Contabilidade' },
  { value: 'personalizada', label: 'Personalizada' }
];

export const fieldTypeOptions = [
  { value: 'text', label: 'Texto' },
  { value: 'password', label: 'Senha' },
  { value: 'email', label: 'E-mail' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Verdadeiro/Falso' }
];