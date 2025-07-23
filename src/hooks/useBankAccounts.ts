import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BankAccount {
  id: string;
  company_id: string;
  bank_name: string;
  account_type: 'corrente' | 'poupanca' | 'carteira' | 'digital';
  agency?: string;
  account_number: string;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewBankAccount {
  bank_name: string;
  account_type: 'corrente' | 'poupanca' | 'carteira' | 'digital';
  agency?: string;
  account_number: string;
  initial_balance: number;
}

export const useBankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('bank_name', { ascending: true });

      if (error) throw error;
      setAccounts((data || []) as BankAccount[]);
    } catch (error: any) {
      console.error('Erro ao buscar contas bancárias:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contas bancárias',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (newAccount: NewBankAccount) => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          ...newAccount,
          current_balance: newAccount.initial_balance
        } as any)
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data as BankAccount]);
      toast({
        title: 'Sucesso',
        description: 'Conta bancária criada com sucesso'
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao criar conta bancária:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar conta bancária',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateAccount = async (id: string, updates: Partial<NewBankAccount>) => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => prev.map(acc => acc.id === id ? data as BankAccount : acc));
      toast({
        title: 'Sucesso',
        description: 'Conta bancária atualizada com sucesso'
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar conta bancária:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar conta bancária',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Conta bancária removida com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao remover conta bancária:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover conta bancária',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts
  };
};