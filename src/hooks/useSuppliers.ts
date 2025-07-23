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

  const validateSupplier = (supplier: NewSupplier): string | null => {
    if (!supplier.name.trim()) {
      return 'Nome é obrigatório';
    }
    
    if (supplier.document) {
      // Validação básica de CNPJ
      const cleanDoc = supplier.document.replace(/\D/g, '');
      if (cleanDoc.length !== 14) {
        return 'CNPJ deve ter 14 dígitos';
      }
    }
    
    if (supplier.email && !supplier.email.includes('@')) {
      return 'E-mail inválido';
    }
    
    return null;
  };

  const checkDuplicateDocument = async (document: string, excludeId?: string): Promise<boolean> => {
    if (!document) return false;
    
    try {
      let query = supabase
        .from('suppliers')
        .select('id')
        .eq('document', document);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking duplicate document:', error);
      return false;
    }
  };

  const createSupplier = async (newSupplier: NewSupplier) => {
    try {
      // Validação
      const validationError = validateSupplier(newSupplier);
      if (validationError) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: validationError,
        });
        return;
      }

      // Verificar duplicidade por documento
      if (newSupplier.document) {
        const isDuplicate = await checkDuplicateDocument(newSupplier.document);
        if (isDuplicate) {
          toast({
            variant: "destructive",
            title: "Fornecedor já existe",
            description: "Já existe um fornecedor com este CNPJ.",
          });
          return;
        }
      }

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
      // Validação
      if (updates.name !== undefined) {
        const validationError = validateSupplier(updates as NewSupplier);
        if (validationError) {
          toast({
            variant: "destructive",
            title: "Dados inválidos",
            description: validationError,
          });
          return;
        }
      }

      // Verificar duplicidade por documento (excluindo o próprio registro)
      if (updates.document) {
        const isDuplicate = await checkDuplicateDocument(updates.document, id);
        if (isDuplicate) {
          toast({
            variant: "destructive",
            title: "Fornecedor já existe",
            description: "Já existe outro fornecedor com este CNPJ.",
          });
          return;
        }
      }

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
    validateSupplier,
    checkDuplicateDocument,
  };
}