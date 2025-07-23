import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FinancialTransaction {
  id: string;
  company_id: string;
  type: 'income' | 'expense' | 'transfer';
  category_id?: string;
  cost_center_id?: string;
  bank_account_id?: string;
  customer_id?: string;
  supplier_id?: string;
  description: string;
  amount: number;
  transaction_date: string;
  due_date?: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  attachment_url?: string;
  is_reconciled: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  financial_categories?: {
    name: string;
    color: string;
  };
  cost_centers?: {
    name: string;
  };
  bank_accounts?: {
    bank_name: string;
    account_number: string;
  };
}

export interface NewFinancialTransaction {
  type: 'income' | 'expense' | 'transfer';
  category_id?: string;
  cost_center_id?: string;
  bank_account_id?: string;
  customer_id?: string;
  supplier_id?: string;
  description: string;
  amount: number;
  transaction_date: string;
  due_date?: string;
  payment_method?: string;
  notes?: string;
}

export const useFinancialTransactions = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      // Get the current user's company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's company from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          user_companies!inner(company_id)
        `)
        .eq('user_id', user.id)
        .single();

      if (!profile?.user_companies?.[0]?.company_id) {
        throw new Error('User company not found');
      }

      const company_id = profile.user_companies[0].company_id;

      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          financial_categories (name, color),
          cost_centers (name),
          bank_accounts (bank_name, account_number)
        `)
        .eq('company_id', company_id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as FinancialTransaction[]);
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar transações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (newTransaction: NewFinancialTransaction) => {
    try {
      // Get the current user's company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's company from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          user_companies!inner(company_id)
        `)
        .eq('user_id', user.id)
        .single();

      if (!profile?.user_companies?.[0]?.company_id) {
        throw new Error('User company not found');
      }

      const company_id = profile.user_companies[0].company_id;

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          ...newTransaction,
          company_id,
          status: 'pending'
        })
        .select(`
          *,
          financial_categories (name, color),
          cost_centers (name),
          bank_accounts (bank_name, account_number)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => [data as FinancialTransaction, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Transação criada com sucesso'
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar transação',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<NewFinancialTransaction>) => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          financial_categories (name, color),
          cost_centers (name),
          bank_accounts (bank_name, account_number)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => prev.map(trans => trans.id === id ? data as FinancialTransaction : trans));
      toast({
        title: 'Sucesso',
        description: 'Transação atualizada com sucesso'
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar transação',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(trans => trans.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Transação removida com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao remover transação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover transação',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const markAsPaid = async (id: string, paymentDate?: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update({
          status: 'paid',
          payment_date: paymentDate || new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select(`
          *,
          financial_categories (name, color),
          cost_centers (name),
          bank_accounts (bank_name, account_number)
        `)
        .single();

      if (error) throw error;

      setTransactions(prev => prev.map(trans => trans.id === id ? data as FinancialTransaction : trans));
      toast({
        title: 'Sucesso',
        description: 'Transação marcada como paga'
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao marcar como pago',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    refetch: fetchTransactions
  };
};