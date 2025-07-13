import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccountReceivable {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  customer_id?: string;
  sale_id?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
  };
}

export interface NewAccountReceivable {
  description: string;
  amount: number;
  due_date: string;
  payment_method?: string;
  notes?: string;
  customer_id?: string;
  sale_id?: string;
}

export function useAccountsReceivable() {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          customers (
            id,
            name
          )
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Update status based on due date
      const updatedAccounts = data?.map(account => {
        if (account.status === 'pending' && new Date(account.due_date) < new Date()) {
          return { ...account, status: 'overdue' as const };
        }
        return account as AccountReceivable;
      }) || [];

      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error fetching accounts receivable:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar as contas a receber.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (newAccount: NewAccountReceivable) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .insert([{ ...newAccount, company_id: '' }]); // company_id será preenchido automaticamente pela RLS

      if (error) throw error;

      toast({
        title: "Conta criada",
        description: "Conta a receber criada com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Não foi possível criar a conta a receber.",
      });
    }
  };

  const updateAccount = async (id: string, updates: Partial<NewAccountReceivable>) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta atualizada",
        description: "Conta a receber atualizada com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar conta",
        description: "Não foi possível atualizar a conta a receber.",
      });
    }
  };

  const receiveAccount = async (id: string, paymentMethod?: string) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta recebida",
        description: "Conta marcada como recebida com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error receiving account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao receber conta",
        description: "Não foi possível marcar a conta como recebida.",
      });
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta excluída",
        description: "Conta a receber excluída com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir a conta a receber.",
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
    receiveAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
}