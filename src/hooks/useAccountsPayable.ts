import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccountPayable {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category?: string;
  notes?: string;
  supplier_id?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  suppliers?: {
    id: string;
    name: string;
  };
}

export interface NewAccountPayable {
  description: string;
  amount: number;
  due_date: string;
  category?: string;
  notes?: string;
  supplier_id?: string;
}

export function useAccountsPayable() {
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          suppliers (
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
        return account as AccountPayable;
      }) || [];

      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error fetching accounts payable:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar as contas a pagar.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (newAccount: NewAccountPayable) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .insert([{ ...newAccount, company_id: '' }]); // company_id será preenchido automaticamente pela RLS

      if (error) throw error;

      toast({
        title: "Conta criada",
        description: "Conta a pagar criada com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Não foi possível criar a conta a pagar.",
      });
    }
  };

  const updateAccount = async (id: string, updates: Partial<NewAccountPayable>) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta atualizada",
        description: "Conta a pagar atualizada com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar conta",
        description: "Não foi possível atualizar a conta a pagar.",
      });
    }
  };

  const payAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta paga",
        description: "Conta marcada como paga com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error paying account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao pagar conta",
        description: "Não foi possível marcar a conta como paga.",
      });
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta excluída",
        description: "Conta a pagar excluída com sucesso.",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir a conta a pagar.",
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