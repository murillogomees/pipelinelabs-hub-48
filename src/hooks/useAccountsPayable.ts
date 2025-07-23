import { useFinancialAccounts, type BaseAccount, type BaseNewAccount } from '@/components/Financial/hooks/useFinancialAccounts';

export interface AccountPayable extends BaseAccount {
  category?: string;
  supplier_id?: string;
  suppliers?: {
    id: string;
    name: string;
  };
}

export interface NewAccountPayable extends BaseNewAccount {
  category?: string;
  supplier_id?: string;
}

export function useAccountsPayable() {
  const {
    accounts,
    loading,
    createAccount,
    updateAccount,
    payAccount: payAccountBase,
    deleteAccount,
    refetch
  } = useFinancialAccounts<AccountPayable, NewAccountPayable>({
    tableName: 'accounts_payable',
    selectFields: `
      *,
      suppliers (
        id,
        name
      )
    `,
    accountType: 'payable'
  });

  // Wrapper for payAccount without payment method parameter
  const payAccount = async (id: string) => {
    return payAccountBase(id);
  };

  return {
    accounts,
    loading,
    createAccount,
    updateAccount,
    payAccount,
    deleteAccount,
    refetch,
  };
}