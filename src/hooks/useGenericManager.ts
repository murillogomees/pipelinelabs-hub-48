
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
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setItems(data as T[] || []);
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
        .from(tableName)
        .insert(item)
        .select()
        .single();

      if (createError) throw createError;

      setItems(prev => [data as T, ...prev]);
      logger.info(`Created item in ${tableName}:`, data);
      return data as T;
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
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setItems(prev => prev.map(item => item.id === id ? data as T : item));
      logger.info(`Updated item in ${tableName}:`, data);
      return data as T;
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
        .from(tableName)
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
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
}
