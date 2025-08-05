
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

interface ProductData {
  id?: string;
  name: string;
  description?: string;
  code: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock?: number;
  max_stock?: number;
  category_id?: string;
  unit?: string;
  is_active?: boolean;
  barcode?: string;
  weight?: number;
  dimensions?: string;
}

interface ProductValidation {
  isValid: boolean;
  isDuplicate: boolean;
  existingProduct?: any;
  field?: string;
}

interface ProductAnalytics {
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  stockValue: number;
  lowStockCount: number;
  recentMovements: any[];
}

interface SearchFilters {
  query?: string;
  category_id?: string;
  is_active?: boolean;
  low_stock?: boolean;
  price_min?: number;
  price_max?: number;
}

export function useProductsManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cache para lista de produtos com filtros
  const cacheKey = `products-${currentCompany?.id}-${JSON.stringify(filters)}-${page}`;
  const { 
    data: productsData, 
    invalidateCache: invalidateProductsCache,
    updateCache: updateProductsCache,
    isLoading: isCacheLoading
  } = useCache({
    key: cacheKey,
    fetcher: async () => {
      if (!currentCompany?.id) return { products: [], count: 0 };

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('company_id', currentCompany.id)
        .order('name');

      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,code.ilike.%${filters.query}%,barcode.ilike.%${filters.query}%`);
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.low_stock) {
        query = query.lt('stock_quantity', supabase.raw('min_stock'));
      }

      if (filters.price_min !== undefined) {
        query = query.gte('price', filters.price_min);
      }

      if (filters.price_max !== undefined) {
        query = query.lte('price', filters.price_max);
      }

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data || [],
        count: count || 0
      };
    },
    ttl: 300000, // 5 minutos
    enabled: !!currentCompany?.id
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.count || 0;

  const validateProduct = useCallback(async (productData: Partial<ProductData>, productId?: string): Promise<ProductValidation> => {
    setIsValidating(true);
    
    try {
      // Validar código único
      if (productData.code) {
        const { data: existingByCode } = await supabase
          .from('products')
          .select('id, name')
          .eq('code', productData.code)
          .eq('company_id', currentCompany?.id)
          .neq('id', productId || '');

        if (existingByCode && existingByCode.length > 0) {
          return {
            isValid: false,
            isDuplicate: true,
            existingProduct: existingByCode[0],
            field: 'code'
          };
        }
      }

      // Validar código de barras único (se fornecido)
      if (productData.barcode) {
        const { data: existingByBarcode } = await supabase
          .from('products')
          .select('id, name')
          .eq('barcode', productData.barcode)
          .eq('company_id', currentCompany?.id)
          .neq('id', productId || '');

        if (existingByBarcode && existingByBarcode.length > 0) {
          return {
            isValid: false,
            isDuplicate: true,
            existingProduct: existingByBarcode[0],
            field: 'barcode'
          };
        }
      }

      return { isValid: true, isDuplicate: false };
    } catch (error) {
      console.error('Error validating product:', error);
      toast({
        title: 'Erro na validação',
        description: 'Erro ao validar produto',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [currentCompany?.id, toast]);

  const createProduct = useCallback(async (productData: ProductData): Promise<any> => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

      // Validações
      const validation = await validateProduct(productData);
      if (!validation.isValid) {
        throw new Error(`${validation.field === 'code' ? 'Código' : 'Código de barras'} já cadastrado`);
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          company_id: currentCompany.id
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar caches relacionados
      await Promise.all([
        invalidateProductsCache(),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Produto criado com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar produto',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateProduct, invalidateProductsCache, queryClient, toast]);

  const updateProduct = useCallback(async (productId: string, productData: Partial<ProductData>): Promise<any> => {
    setIsLoading(true);
    
    try {
      // Validações se estiver alterando código ou código de barras
      if (productData.code || productData.barcode) {
        const validation = await validateProduct(productData, productId);
        if (!validation.isValid) {
          throw new Error(`${validation.field === 'code' ? 'Código' : 'Código de barras'} já cadastrado`);
        }
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar cache local
      if (productsData?.products) {
        const updatedList = productsData.products.map(p => 
          p.id === productId ? data : p
        );
        updateProductsCache({ ...productsData, products: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Produto atualizado com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar produto',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateProduct, productsData, updateProductsCache, toast]);

  const deleteProduct = useCallback(async (productId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Soft delete - marcar como inativo
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      // Atualizar cache local
      if (productsData?.products) {
        const updatedList = productsData.products.filter(p => p.id !== productId);
        updateProductsCache({ ...productsData, products: updatedList, count: productsData.count - 1 });
      }

      toast({
        title: 'Sucesso',
        description: 'Produto desativado com sucesso'
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao desativar produto',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, productsData, updateProductsCache, toast]);

  const getProductAnalytics = useCallback(async (productId: string): Promise<ProductAnalytics | null> => {
    try {
      const [salesData, stockMovements] = await Promise.all([
        supabase
          .from('sale_items')
          .select('quantity, price, sale:sales(created_at)')
          .eq('product_id', productId),
        
        supabase
          .from('stock_movements')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const totalSales = salesData.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalRevenue = salesData.data?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
      const averagePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

      const product = await supabase
        .from('products')
        .select('price, cost_price, stock_quantity')
        .eq('id', productId)
        .single();

      const stockValue = product.data ? 
        (product.data.cost_price || 0) * product.data.stock_quantity : 0;

      return {
        totalSales,
        totalRevenue,
        averagePrice,
        stockValue,
        lowStockCount: 0, // Será calculado em outro local se necessário
        recentMovements: stockMovements.data || []
      };
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      return null;
    }
  }, []);

  const updateStock = useCallback(async (productId: string, quantity: number, type: 'entrada' | 'saida', reason?: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('register_stock_movement', {
        p_product_id: productId,
        p_movement_type: type,
        p_quantity: Math.abs(quantity),
        p_reason: reason
      });

      if (error) throw error;

      await invalidateProductsCache();

      toast({
        title: 'Sucesso',
        description: `Estoque ${type === 'entrada' ? 'aumentado' : 'reduzido'} com sucesso`
      });

      return data;
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar estoque',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [invalidateProductsCache, toast]);

  const searchProducts = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset para primeira página
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const refreshProducts = useCallback(async () => {
    await invalidateProductsCache();
  }, [invalidateProductsCache]);

  // Auto-refresh a cada 10 minutos
  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshProducts();
    }, 600000);

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshProducts]);

  return {
    // Estados
    isLoading: isLoading || isCacheLoading,
    isValidating,
    products,
    totalProducts,
    filters,
    page,
    pageSize,

    // Funções principais
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    loadMore,

    // Validações
    validateProduct,

    // Analytics e utilitários
    getProductAnalytics,
    updateStock,
    refreshProducts,

    // Utilitários
    getProductById: useCallback((id: string) => 
      products.find(p => p.id === id), [products]
    ),

    // Estatísticas
    hasMorePages: products.length < totalProducts,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / pageSize),

    // Filtros auxiliares
    activeProducts: products.filter(p => p.is_active !== false),
    inactiveProducts: products.filter(p => p.is_active === false),
    lowStockProducts: products.filter(p => p.stock_quantity <= (p.min_stock || 0)),

    // Status
    isEmpty: products.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
