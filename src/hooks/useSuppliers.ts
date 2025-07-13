import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  contact_person?: string;
  is_active: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NewSupplier {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  contact_person?: string;
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar fornecedores",
        description: "Não foi possível carregar a lista de fornecedores.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (newSupplier: NewSupplier) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([{ ...newSupplier, company_id: '' }]); // company_id será preenchido automaticamente pela RLS

      if (error) throw error;

      toast({
        title: "Fornecedor criado",
        description: "Fornecedor criado com sucesso.",
      });

      fetchSuppliers();
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar fornecedor",
        description: "Não foi possível criar o fornecedor.",
      });
    }
  };

  const updateSupplier = async (id: string, updates: Partial<NewSupplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fornecedor atualizado",
        description: "Fornecedor atualizado com sucesso.",
      });

      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar fornecedor",
        description: "Não foi possível atualizar o fornecedor.",
      });
    }
  };

  const toggleSupplierStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isActive ? "Fornecedor ativado" : "Fornecedor desativado",
        description: `Fornecedor ${isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchSuppliers();
    } catch (error) {
      console.error('Error toggling supplier status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do fornecedor.",
      });
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fornecedor excluído",
        description: "Fornecedor excluído com sucesso.",
      });

      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir fornecedor",
        description: "Não foi possível excluir o fornecedor.",
      });
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    toggleSupplierStatus,
    deleteSupplier,
    refetch: fetchSuppliers,
  };
}