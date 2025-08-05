import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';

interface SimpleProductData {
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
  const [products, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchProducts = useCallback(async () => {
    if (!currentCompany?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, toast]);

  const createProduct = useCallback(async (productData: SimpleProductData) => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

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

      await fetchProducts();
      queryClient.invalidateQueries({ queryKey: ['products'] });

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
  }, [currentCompany?.id, fetchProducts, queryClient, toast]);

  const updateProduct = useCallback(async (productId: string, productData: Partial<SimpleProductData>) => {
    setIsLoading(true);
    
    try {
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

      await fetchProducts();

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
  }, [currentCompany?.id, fetchProducts, toast]);

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

      await fetchProducts();

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
  }, [currentCompany?.id, fetchProducts, toast]);

  const searchProducts = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Auto-fetch products when company changes
  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    isLoading,
    products,
    totalProducts: products.length,
    filters,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    refreshProducts: fetchProducts,
    getProductById: useCallback((id: string) => 
      products.find((p: any) => p.id === id), [products]
    ),
    activeProducts: products.filter((p: any) => p.is_active !== false),
    inactiveProducts: products.filter((p: any) => p.is_active === false),
    lowStockProducts: products.filter((p: any) => 
      Number(p.stock_quantity || 0) <= Number(p.min_stock || 0)),
    outOfStockProducts: products.filter((p: any) => 
      Number(p.stock_quantity || 0) === 0),
    isEmpty: products.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
