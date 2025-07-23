import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FinancialCategory {
  id: string;
  company_id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewFinancialCategory {
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  color?: string;
}

export const useFinancialCategories = () => {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories((data || []) as FinancialCategory[]);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar categorias',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (newCategory: NewFinancialCategory) => {
    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .insert(newCategory as any)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data as FinancialCategory]);
      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso'
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar categoria',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<NewFinancialCategory>) => {
    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(cat => cat.id === id ? data as FinancialCategory : cat));
      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso'
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar categoria',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Categoria removida com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao remover categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover categoria',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
};