
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
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  barcode?: string;
  is_active?: boolean;
  weight?: number;
  dimensions?: string;
  supplier_id?: string;
}

interface ProductValidation {
  isValid: boolean;
  isDuplicate: boolean;
  existingProduct?: any;
  codeExists?: boolean;
  barcodeExists?: boolean;
}

interface SearchFilters {
  query?: string;
  is_active?: boolean;
  low_stock?: boolean;
  out_of_stock?: boolean;
  supplier_id?: string;
  min_price?: number;
  max_price?: number;
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
        .order('created_at', { ascending: false });

      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,code.ilike.%${filters.query}%,barcode.ilike.%${filters.query}%`);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters.out_of_stock) {
        query = query.eq('stock_quantity', 0);
      }

      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }

      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
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
    ttl: 300000,
    enabled: !!currentCompany?.id
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.count || 0;

  const validateProduct = useCallback(async (productData: Partial<ProductData>, productId?: string): Promise<ProductValidation> => {
    setIsValidating(true);
    
    try {
      let codeExists = false;
      let barcodeExists = false;
      
      if (productData.code) {
        const { data: existingCode } = await supabase
          .from('products')
          .select('id, code')
          .eq('code', productData.code)
          .eq('company_id', currentCompany?.id)
          .neq('id', productId || '');

        codeExists = existingCode && existingCode.length > 0;
      }

      if (productData.barcode) {
        const { data: existingBarcode } = await supabase
          .from('products')
          .select('id, barcode')
          .eq('barcode', productData.barcode)
          .eq('company_id', currentCompany?.id)
          .neq('id', productId || '');

        barcodeExists = existingBarcode && existingBarcode.length > 0;
      }

      const isDuplicate = codeExists || barcodeExists;

      return { 
        isValid: !isDuplicate, 
        isDuplicate,
        codeExists,
        barcodeExists
      };
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

      const validation = await validateProduct(productData);
      if (!validation.isValid) {
        let errorMsg = 'Dados duplicados: ';
        if (validation.codeExists) errorMsg += 'Código já existe. ';
        if (validation.barcodeExists) errorMsg += 'Código de barras já existe.';
        throw new Error(errorMsg);
      }

      // Preparar dados baseados no schema real da tabela products
      const insertData = {
        name: productData.name,
        description: productData.description,
        code: productData.code,
        price: productData.price,
        cost_price: productData.cost_price,
        stock_quantity: productData.stock_quantity || 0,
        min_stock: productData.min_stock,
        max_stock: productData.max_stock,
        unit: productData.unit,
        barcode: productData.barcode,
        is_active: productData.is_active ?? true,
        weight: productData.weight,
        dimensions: productData.dimensions,
        supplier_id: productData.supplier_id,
        company_id: currentCompany.id
      };

      const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

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
      if (productData.code || productData.barcode) {
        const validation = await validateProduct(productData, productId);
        if (!validation.isValid) {
          let errorMsg = 'Dados duplicados: ';
          if (validation.codeExists) errorMsg += 'Código já existe. ';
          if (validation.barcodeExists) errorMsg += 'Código de barras já existe.';
          throw new Error(errorMsg);
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
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      if (productsData?.products) {
        const updatedList = productsData.products.map(p => 
          p.id === productId ? { ...p, is_active: false } : p
        );
        updateProductsCache({ ...productsData, products: updatedList });
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

  const searchProducts = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const refreshProducts = useCallback(async () => {
    await invalidateProductsCache();
  }, [invalidateProductsCache]);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshProducts();
    }, 600000);

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshProducts]);

  return {
    isLoading: isLoading || isCacheLoading,
    isValidating,
    products,
    totalProducts,
    filters,
    page,
    pageSize,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    loadMore,
    validateProduct,
    refreshProducts,
    getProductById: useCallback((id: string) => 
      products.find(p => p.id === id), [products]
    ),
    hasMorePages: products.length < totalProducts,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / pageSize),
    activeProducts: products.filter(p => p.is_active !== false),
    inactiveProducts: products.filter(p => p.is_active === false),
    lowStockProducts: products.filter(p => 
      Number(p.stock_quantity || 0) <= Number(p.min_stock || 0)),
    outOfStockProducts: products.filter(p => 
      Number(p.stock_quantity || 0) === 0),
    isEmpty: products.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
