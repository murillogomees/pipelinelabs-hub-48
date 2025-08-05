
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

interface ProductFilters {
  searchTerm: string;
  status?: 'all' | 'active' | 'inactive';
  lowStock?: boolean;
}

export function useProductsManager() {
  const genericManager = useGenericManager<Product>('products');
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    status: 'all',
    lowStock: false
  });

  const searchItems = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  const searchProducts = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshItems = useCallback(() => {
    return genericManager.fetchItems();
  }, [genericManager.fetchItems]);

  const getItemById = useCallback((id: string) => {
    return genericManager.items.find(item => item.id === id);
  }, [genericManager.items]);

  const filteredProducts = useMemo(() => {
    let filtered = genericManager.items;
    
    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(product => 
        filters.status === 'active' ? product.is_active : !product.is_active
      );
    }

    // Filter by low stock
    if (filters.lowStock) {
      filtered = filtered.filter(product => 
        (product.stock_quantity || 0) <= (product.min_stock || 0)
      );
    }

    return filtered;
  }, [genericManager.items, filters]);

  const lowStockProducts = useMemo(() => {
    return genericManager.items.filter(product => 
      (product.stock_quantity || 0) <= (product.min_stock || 0)
    );
  }, [genericManager.items]);

  const totalProducts = genericManager.items.length;
  const isEmpty = filteredProducts.length === 0;
  const isFiltered = filters.searchTerm !== '' || filters.status !== 'all' || filters.lowStock === true;

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
    searchProducts,
    refreshItems,
    getItemById,
    searchTerm: filters.searchTerm,
    filters,
    allProducts: genericManager.items,
    totalProducts,
    isEmpty,
    isFiltered,
    lowStockProducts,
  };
}
