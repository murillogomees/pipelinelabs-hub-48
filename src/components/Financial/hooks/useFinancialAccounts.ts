// Base hook for financial accounts with shared functionality

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { updateAccountsStatus } from '../utils';
import { FINANCIAL_MESSAGES } from '../constants';

export interface BaseAccount {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface BaseNewAccount {
  description: string;
  amount: number;
  due_date: string;
  notes?: string;
}

interface UseFinancialAccountsConfig<TableName extends string> {
  tableName: TableName;
  selectFields?: string;
  accountType: 'payable' | 'receivable';
  orderBy?: { column: string; ascending: boolean };
}

export function useFinancialAccounts<T extends BaseAccount, N extends BaseNewAccount>(
  config: UseFinancialAccountsConfig<'accounts_payable' | 'accounts_receivable'>
) {
  const [accounts, setAccounts] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { tableName, selectFields = '*', accountType, orderBy = { column: 'due_date', ascending: true } } = config;

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(tableName as any)
        .select(selectFields)
        .order(orderBy.column, { ascending: orderBy.ascending });

      if (error) throw error;

      // Update status based on due date
      const updatedAccounts = updateAccountsStatus((data || []) as unknown as T[]);
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar contas",
        description: FINANCIAL_MESSAGES.ERROR.LOAD_ACCOUNTS,
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (newAccount: N) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .insert([{ ...newAccount, company_id: '' }]); // company_id preenchido pela RLS

      if (error) throw error;

      toast({
        title: "Conta criada",
        description: FINANCIAL_MESSAGES.SUCCESS.ACCOUNT_CREATED,
      });

      fetchAccounts();
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: FINANCIAL_MESSAGES.ERROR.CREATE_ACCOUNT,
      });
    }
  };

  const updateAccount = async (id: string, updates: Partial<N>) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta atualizada",
        description: FINANCIAL_MESSAGES.SUCCESS.ACCOUNT_UPDATED,
      });

      fetchAccounts();
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar conta",
        description: FINANCIAL_MESSAGES.ERROR.UPDATE_ACCOUNT,
      });
    }
  };

  const payAccount = async (id: string, paymentMethod?: string) => {
    try {
      const updateData: any = {
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0]
      };

      // Add payment_method only for receivables
      if (accountType === 'receivable' && paymentMethod) {
        updateData.payment_method = paymentMethod;
      }

      const { error } = await supabase
        .from(tableName as any)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      const message = accountType === 'receivable' 
        ? FINANCIAL_MESSAGES.SUCCESS.ACCOUNT_RECEIVED
        : FINANCIAL_MESSAGES.SUCCESS.ACCOUNT_PAID;

      toast({
        title: accountType === 'receivable' ? "Conta recebida" : "Conta paga",
        description: message,
      });

      fetchAccounts();
    } catch (error) {
      console.error(`Error paying ${tableName}:`, error);
      const errorMessage = accountType === 'receivable' 
        ? FINANCIAL_MESSAGES.ERROR.RECEIVE_ACCOUNT
        : FINANCIAL_MESSAGES.ERROR.PAY_ACCOUNT;

      toast({
        variant: "destructive",
        title: accountType === 'receivable' ? "Erro ao receber conta" : "Erro ao pagar conta",
        description: errorMessage,
      });
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta excluída",
        description: FINANCIAL_MESSAGES.SUCCESS.ACCOUNT_DELETED,
      });

      fetchAccounts();
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: FINANCIAL_MESSAGES.ERROR.DELETE_ACCOUNT,
      });
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
    payAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
}