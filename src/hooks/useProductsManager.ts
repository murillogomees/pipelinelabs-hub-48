
import { useMemo, useState } from 'react';
import { useGenericManager } from './useGenericManager';
import type { Database } from '@/integrations/supabase/types';
import type { ProductFilters, SearchFilters } from '@/types/products';
import type { CreateProductData } from '@/components/Products/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export const useProductsManager = () => {
  const baseManager = useGenericManager<Product>('products');
  const [filters, setFilters] = useState<ProductFilters>({});

  // Additional computed properties
  const totalProducts = useMemo(() => baseManager.items.length, [baseManager.items]);
  
  const lowStockProducts = useMemo(() => 
    baseManager.items.filter(product => (product.stock_quantity || 0) < (product.min_stock || 10)),
    [baseManager.items]
  );

  const isEmpty = useMemo(() => baseManager.items.length === 0, [baseManager.items]);
  
  // Filter and search functionality
  const applyFilters = (newFilters: ProductFilters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
  };

  const searchProducts = (searchFilters: SearchFilters) => {
    console.log('Searching products:', searchFilters);
    if (searchFilters.search) {
      applyFilters({ search: searchFilters.search });
    }
  };

  const refreshItems = async () => {
    await baseManager.fetchItems();
  };

  // Override createItem to accept CreateProductData type
  const createProduct = async (productData: CreateProductData) => {
    // Convert CreateProductData to the format expected by baseManager
    return baseManager.createItem(productData as any);
  };

  return {
    // Base manager properties
    products: baseManager.items,
    loading: baseManager.loading,
    isLoading: baseManager.loading,
    error: baseManager.error,
    
    // Base manager methods
    createProduct,
    updateProduct: baseManager.updateItem,
    deleteProduct: baseManager.deleteItem,
    fetchProducts: baseManager.fetchItems,
    
    // Additional properties
    allProducts: baseManager.items,
    totalProducts,
    lowStockProducts,
    isEmpty,
    isFiltered: Object.keys(filters).length > 0,
    filters,
    
    // Additional methods
    searchProducts,
    applyFilters,
    refreshItems,
  };
};
