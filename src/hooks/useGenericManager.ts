
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useGenericManager');

export function useGenericManager<T extends { id: string }>(tableName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from(tableName as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setItems((data as unknown as T[]) || []);
      logger.info(`Fetched ${data?.length || 0} items from ${tableName}`);
    } catch (err: any) {
      logger.error(`Error fetching items from ${tableName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  const createItem = useCallback(async (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from(tableName as any)
        .insert(item as any)
        .select()
        .single();

      if (createError) throw createError;

      const newItem = data as unknown as T;
      setItems(prev => [newItem, ...prev]);
      logger.info(`Created item in ${tableName}:`, newItem);
      return newItem;
    } catch (err: any) {
      logger.error(`Error creating item in ${tableName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from(tableName as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedItem = data as unknown as T;
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      logger.info(`Updated item in ${tableName}:`, updatedItem);
      return updatedItem;
    } catch (err: any) {
      logger.error(`Error updating item in ${tableName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setItems(prev => prev.filter(item => item.id !== id));
      logger.info(`Deleted item from ${tableName}:`, id);
    } catch (err: any) {
      logger.error(`Error deleting item from ${tableName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  return {
    items,
    loading,
    isLoading: loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
}
