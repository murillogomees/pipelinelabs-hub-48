
import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';

interface GenericManagerConfig<T, CreateData, UpdateData, Filters> {
  tableName: string;
  queryKey: string;
  generateNumber?: (companyId: string) => Promise<string>;
  validateCreate?: (data: CreateData) => boolean;
  transformCreate?: (data: CreateData, companyId: string) => any;
  transformUpdate?: (data: UpdateData) => any;
  orderBy?: { column: string; ascending: boolean };
}

export function useGenericManager<T extends { id: string; company_id?: string }, CreateData, UpdateData, Filters>(
  config: GenericManagerConfig<T, CreateData, UpdateData, Filters>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [filters, setFilters] = useState<Filters>({} as Filters);
  
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchItems = useCallback(async () => {
    if (!currentCompany?.id) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from(config.tableName)
        .select('*')
        .eq('company_id', currentCompany.id);

      if (config.orderBy) {
        query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending });
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error(`Error fetching ${config.tableName}:`, error);
      toast({
        title: 'Erro',
        description: `Erro ao carregar ${config.tableName}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, toast, config.tableName, config.orderBy]);

  const createItem = useCallback(async (itemData: CreateData) => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

      if (config.validateCreate && !config.validateCreate(itemData)) {
        throw new Error('Dados inválidos');
      }

      const insertData = config.transformCreate 
        ? config.transformCreate(itemData, currentCompany.id)
        : { ...itemData, company_id: currentCompany.id };

      const { data, error } = await supabase
        .from(config.tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await fetchItems();
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });

      toast({
        title: 'Sucesso',
        description: `${config.tableName} criado com sucesso`
      });

      return data;
    } catch (error: any) {
      console.error(`Error creating ${config.tableName}:`, error);
      toast({
        title: 'Erro',
        description: error.message || `Erro ao criar ${config.tableName}`,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, fetchItems, queryClient, toast, config]);

  const updateItem = useCallback(async (itemId: string, itemData: Partial<UpdateData>) => {
    setIsLoading(true);
    
    try {
      const updateData = config.transformUpdate 
        ? config.transformUpdate(itemData as UpdateData)
        : { ...itemData, updated_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from(config.tableName)
        .update(updateData)
        .eq('id', itemId)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      await fetchItems();

      toast({
        title: 'Sucesso',
        description: `${config.tableName} atualizado com sucesso`
      });

      return data;
    } catch (error: any) {
      console.error(`Error updating ${config.tableName}:`, error);
      toast({
        title: 'Erro',
        description: error.message || `Erro ao atualizar ${config.tableName}`,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, fetchItems, toast, config]);

  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from(config.tableName)
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      await fetchItems();

      toast({
        title: 'Sucesso',
        description: `${config.tableName} desativado com sucesso`
      });
    } catch (error: any) {
      console.error(`Error deleting ${config.tableName}:`, error);
      toast({
        title: 'Erro',
        description: error.message || `Erro ao desativar ${config.tableName}`,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, fetchItems, toast, config]);

  const searchItems = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  // Auto-fetch items when company changes
  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    isLoading,
    items,
    totalItems: items.length,
    filters,
    createItem,
    updateItem,
    deleteItem,
    searchItems,
    refreshItems: fetchItems,
    getItemById: useCallback((id: string) => 
      items.find((item: T) => item.id === id), [items]
    ),
    activeItems: items.filter((item: any) => item.is_active !== false),
    inactiveItems: items.filter((item: any) => item.is_active === false),
    isEmpty: items.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof Filters])
  };
}
