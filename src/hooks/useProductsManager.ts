
import { useState, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  stock_quantity: number;
  category?: string;
  description?: string;
}

export const useProductsManager = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Produto Exemplo',
          code: 'PROD001',
          price: 99.99,
          stock_quantity: 10
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

  const searchProducts = useCallback(async (query: string) => {
    // Mock search
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase())
    );
  }, [allProducts]);

  const refreshItems = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return {
    allProducts,
    products: allProducts, // Alias for compatibility
    totalProducts: allProducts.length,
    isLoading,
    error,
    filters,
    fetchProducts,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshItems
  };
};
