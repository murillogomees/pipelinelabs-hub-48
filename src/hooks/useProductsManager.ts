
import { useState, useCallback } from 'react';
import type { SearchFilters } from '@/types/products';

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  stock_quantity: number;
  min_stock?: number;
  max_stock?: number;
  category?: string;
  description?: string;
  is_active: boolean;
  cost_price?: number;
  barcode?: string;
  brand?: string;
  category_id?: string;
  cest_code?: string;
  cofins_fixed?: number;
  company_id?: string;
  condition?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProductsManager = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data with all required properties
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Produto Exemplo',
          code: 'PROD001',
          price: 99.99,
          stock_quantity: 10,
          min_stock: 5,
          is_active: true,
          description: 'Produto de exemplo'
        }
      ];
      setAllProducts(mockProducts);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData: Partial<Product>) => {
    setIsLoading(true);
    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productData.name || '',
        code: productData.code || '',
        price: productData.price || 0,
        stock_quantity: productData.stock_quantity || 0,
        min_stock: productData.min_stock || 0,
        is_active: true,
        ...productData
      };
      setAllProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar produto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    setIsLoading(true);
    try {
      setAllProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar produto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      setAllProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir produto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (searchFilters: SearchFilters) => {
    const query = searchFilters.search || searchFilters.query || '';
    setFilters(searchFilters);
    
    // Mock search - filter products based on query
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase())
    );
  }, [allProducts]);

  const refreshItems = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Computed properties
  const products = allProducts;
  const totalProducts = allProducts.length;
  const isEmpty = allProducts.length === 0;
  const isFiltered = Object.keys(filters).some(key => filters[key as keyof SearchFilters]);
  const lowStockProducts = allProducts.filter(p => 
    (p.stock_quantity || 0) <= (p.min_stock || 0)
  );

  return {
    allProducts,
    products,
    totalProducts,
    isLoading,
    error,
    filters,
    fetchProducts,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshItems,
    isEmpty,
    isFiltered,
    lowStockProducts
  };
};
