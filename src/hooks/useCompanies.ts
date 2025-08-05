import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  trade_name?: string;
  legal_name?: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  tax_regime?: string;
  state_registration?: string;
  municipal_registration?: string;
  legal_representative?: string;
  fiscal_email?: string;
  created_at: string;
  updated_at: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching companies:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar empresas",
          description: error.message,
        });
        return;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar empresas",
        description: "Ocorreu um erro ao carregar as empresas.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Empresa criada",
        description: "A empresa foi criada com sucesso.",
      });

      await fetchCompanies();
      return data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar empresa",
        description: error.message || "Ocorreu um erro ao criar a empresa.",
      });
      throw error;
    }
  };

  const updateCompany = async (id: string, companyData: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Empresa atualizada",
        description: "A empresa foi atualizada com sucesso.",
      });

      await fetchCompanies();
      return data;
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar empresa",
        description: error.message || "Ocorreu um erro ao atualizar a empresa.",
      });
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Empresa excluída",
        description: "A empresa foi excluída com sucesso.",
      });

      await fetchCompanies();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir empresa",
        description: error.message || "Ocorreu um erro ao excluir a empresa.",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies,
  };
}