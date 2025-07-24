import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  trade_name?: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipcode?: string;
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
    deleteCompany,
    refetch: fetchCompanies,
  };
}