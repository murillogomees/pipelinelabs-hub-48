// Financial constants and utilities

export const FINANCIAL_CATEGORIES = {
  EXPENSE_CATEGORIES: [
    'Fornecedores',
    'Serviços', 
    'Impostos',
    'Aluguel',
    'Energia',
    'Telefone',
    'Internet',
    'Combustível',
    'Material de Escritório',
    'Marketing',
    'Outros'
  ],
  PAYMENT_METHODS: [
    'Dinheiro',
    'PIX',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Transferência Bancária',
    'Boleto',
    'Cheque',
    'Outros'
  ],
  DRE_CATEGORIES: {
    COST_OF_GOODS_SOLD: ['Fornecedores'],
    OPERATING_EXPENSES: ['Aluguel', 'Energia', 'Telefone', 'Internet', 'Material de Escritório', 'Marketing'],
    ADMINISTRATIVE_EXPENSES: ['Serviços', 'Outros'],
    TAXES: ['Impostos'],
    FINANCIAL_EXPENSES: ['Combustível']
  }
} as const;

export const FINANCIAL_STATUS = {
  PENDING: 'pending',
  PAID: 'paid', 
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const;

export const PERIOD_OPTIONS = [
  { value: 'next-7-days', label: 'Próximos 7 dias' },
  { value: 'next-15-days', label: 'Próximos 15 dias' },
  { value: 'next-30-days', label: 'Próximos 30 dias' },
  { value: 'current-week', label: 'Esta semana' },
  { value: 'current-month', label: 'Este mês' }
] as const;

export const FINANCIAL_MESSAGES = {
  SUCCESS: {
    ACCOUNT_CREATED: 'Conta criada com sucesso',
    ACCOUNT_UPDATED: 'Conta atualizada com sucesso',
    ACCOUNT_PAID: 'Conta marcada como paga com sucesso',
    ACCOUNT_RECEIVED: 'Conta marcada como recebida com sucesso',
    ACCOUNT_DELETED: 'Conta excluída com sucesso'
  },
  ERROR: {
    LOAD_ACCOUNTS: 'Não foi possível carregar as contas',
    CREATE_ACCOUNT: 'Não foi possível criar a conta',
    UPDATE_ACCOUNT: 'Não foi possível atualizar a conta',
    PAY_ACCOUNT: 'Não foi possível marcar a conta como paga',
    RECEIVE_ACCOUNT: 'Não foi possível marcar a conta como recebida',
    DELETE_ACCOUNT: 'Não foi possível excluir a conta',
    REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios'
  }
} as const;

export type FinancialStatus = typeof FINANCIAL_STATUS[keyof typeof FINANCIAL_STATUS];
export type ExpenseCategory = typeof FINANCIAL_CATEGORIES.EXPENSE_CATEGORIES[number];
export type PaymentMethod = typeof FINANCIAL_CATEGORIES.PAYMENT_METHODS[number];