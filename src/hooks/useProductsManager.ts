
import { useMemo } from 'react';
import { useGenericManager } from './useGenericManager';
import type { Database } from '@/integrations/supabase/types';
import type { ProductFilters } from '@/types/products';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export const useProductsManager = () => {
  const baseManager = useGenericManager<Product, ProductInsert, ProductUpdate>('products');

  // Additional computed properties
  const totalProducts = useMemo(() => baseManager.items.length, [baseManager.items]);
  
  const lowStockProducts = useMemo(() => 
    baseManager.items.filter(product => (product.stock_quantity || 0) < (product.min_stock_level || 10)),
    [baseManager.items]
  );

  const isEmpty = useMemo(() => baseManager.items.length === 0, [baseManager.items]);
  
  // Filter and search functionality
  const applyFilters = (filters: ProductFilters) => {
    console.log('Applying filters:', filters);
    // Filter logic will be implemented here
  };

  const searchProducts = (query: string) => {
    console.log('Searching products:', query);
    // Search logic will be implemented here
  };

  return {
    // Base manager properties
    products: baseManager.items,
    loading: baseManager.loading,
    isLoading: baseManager.loading,
    error: baseManager.error,
    
    // Base manager methods
    createProduct: baseManager.createItem,
    updateProduct: baseManager.updateItem,
    deleteProduct: baseManager.deleteItem,
    fetchProducts: baseManager.fetchItems,
    
    // Additional properties
    allProducts: baseManager.items,
    totalProducts,
    lowStockProducts,
    isEmpty,
    isFiltered: false, // This will be computed based on applied filters
    filters: {} as ProductFilters, // Current filters state
    
    // Additional methods
    searchProducts,
    applyFilters,
  };
};
