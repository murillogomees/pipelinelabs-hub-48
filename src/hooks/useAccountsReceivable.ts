import { useFinancialAccounts, type BaseAccount, type BaseNewAccount } from '@/components/Financial/hooks/useFinancialAccounts';

export interface AccountReceivable extends BaseAccount {
  payment_method?: string;
  customer_id?: string;
  sale_id?: string;
  customers?: {
    id: string;
    name: string;
  };
}

export interface NewAccountReceivable extends BaseNewAccount {
  payment_method?: string;
  customer_id?: string;
  sale_id?: string;
}

export function useAccountsReceivable() {
  const {
    accounts,
    loading,
    createAccount,
    updateAccount,
    payAccount: payAccountBase,
    deleteAccount,
    refetch
  } = useFinancialAccounts<AccountReceivable, NewAccountReceivable>({
    tableName: 'accounts_receivable',
    selectFields: `
      *,
      customers (
        id,
        name
      )
    `,
    accountType: 'receivable'
  });

  // Wrapper for receiveAccount with payment method parameter
  const receiveAccount = async (id: string, paymentMethod?: string) => {
    return payAccountBase(id, paymentMethod);
  };

  return {
    accounts,
    loading,
    createAccount,
    updateAccount,
    receiveAccount,
    deleteAccount,
    refetch,
  };
}