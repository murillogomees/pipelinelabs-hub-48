import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NotificationHelpers } from '@/utils/notifications';
import { Product } from '../types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }
        return data as Product[];
      } catch (error) {
        console.error('Products query failed:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: Omit<TablesInsert<'products'>, 'company_id'>) => {
      // Tentar obter company_id do usuário ou usar empresa padrão
      let companyId = null;
      
      try {
        const { data: userCompany } = await supabase
          .from('user_companies')
          .select('company_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .eq('is_active', true)
          .maybeSingle();
        
        companyId = userCompany?.company_id;
      } catch (error) {
        console.warn('Error getting user company:', error);
      }

      // Se não encontrou, usar primeira empresa disponível
      if (!companyId) {
        const { data: defaultCompany } = await supabase
          .from('companies')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        companyId = defaultCompany?.id;
      }

      const { data, error } = await supabase
        .from('products')
        .insert({ ...productData, company_id: companyId } as TablesInsert<'products'>)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto criado',
        description: 'O produto foi criado com sucesso.',
      });
      
      // Criar notificação de sistema
      NotificationHelpers.newProduct(data.name);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & TablesUpdate<'products'>) => {
      const { data: result, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto atualizado',
        description: 'O produto foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto excluído',
        description: 'O produto foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      // Buscar o produto original
      const { data: originalProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (fetchError) throw fetchError;

      // Criar novo produto com dados duplicados
      const { company_id, id, created_at, updated_at, ...productData } = originalProduct;
      
      const duplicatedProduct = {
        ...productData,
        name: `${productData.name} (Cópia)`,
        code: `${productData.code}_COPY_${Date.now()}`,
      };

      const { data, error } = await supabase
        .from('products')
        .insert(duplicatedProduct as TablesInsert<'products'>)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto duplicado',
        description: `O produto "${data.name}" foi criado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao duplicar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}