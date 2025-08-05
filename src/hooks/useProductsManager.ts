
import { useGenericManager } from './useGenericManager';
import { useState, useCallback, useMemo } from 'react';

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useProductsManager() {
  const genericManager = useGenericManager<Product>('products');
  const [searchTerm, setSearchTerm] = useState('');

  const searchItems = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const refreshItems = useCallback(() => {
    return genericManager.fetchItems();
  }, [genericManager.fetchItems]);

  const getItemById = useCallback((id: string) => {
    return genericManager.items.find(item => item.id === id);
  }, [genericManager.items]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return genericManager.items;
    
    return genericManager.items.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [genericManager.items, searchTerm]);

  return {
    products: filteredProducts,
    loading: genericManager.loading,
    isLoading: genericManager.isLoading,
    error: genericManager.error,
    createProduct: genericManager.createItem,
    updateProduct: genericManager.updateItem,
    deleteProduct: genericManager.deleteItem,
    fetchProducts: genericManager.fetchItems,
    searchItems,
    refreshItems,
    getItemById,
    searchTerm,
    allProducts: genericManager.items,
  };
}
