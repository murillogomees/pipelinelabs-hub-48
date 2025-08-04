import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AccessLevel } from '@/components/Admin/AccessLevels/types';

export interface AccessLevelWithCount extends AccessLevel {
  _count?: {
    users: number;
  };
}

export function useAccessLevels() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accessLevels = [], refetch, isLoading, error } = useQuery({
    queryKey: ['access-levels'],
    queryFn: async (): Promise<AccessLevelWithCount[]> => {
      const { data: levelsData, error: levelsError } = await supabase
        .from('access_levels')
        .select('*')
        .order('created_at', { ascending: false });

      if (levelsError) throw levelsError;

      // Count users for each access level in parallel
      const levelsWithCount = await Promise.all(
        (levelsData || []).map(async (level: any) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('access_level_id', level.id)
            .eq('is_active', true);
          
          return {
            ...level,
            _count: { users: count || 0 }
          } as AccessLevelWithCount;
        })
      );

      return levelsWithCount;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const createAccessLevel = useMutation({
    mutationFn: async (data: Omit<AccessLevel, 'id' | 'created_at' | 'updated_at'>) => {
      const submitData = {
        ...data,
        name: data.name.toLowerCase().replace(/\s+/g, '_')
      };

      const { error } = await supabase
        .from('access_levels')
        .insert([submitData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-levels'] });
      toast({
        title: "Sucesso",
        description: "Nível de acesso criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar nível de acesso",
        variant: "destructive",
      });
    },
  });

  const updateAccessLevel = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccessLevel> }) => {
      const submitData = {
        ...data,
        name: data.name ? data.name.toLowerCase().replace(/\s+/g, '_') : undefined
      };

      const { error } = await supabase
        .from('access_levels')
        .update(submitData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-levels'] });
      toast({
        title: "Sucesso",
        description: "Nível de acesso atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar nível de acesso",
        variant: "destructive",
      });
    },
  });

  const deleteAccessLevel = useMutation({
    mutationFn: async (level: AccessLevelWithCount) => {
      if (level.is_system) {
        throw new Error("Níveis de acesso do sistema não podem ser excluídos");
      }

      if (level._count?.users && level._count.users > 0) {
        throw new Error("Não é possível excluir um nível de acesso que possui usuários");
      }

      const { error } = await supabase
        .from('access_levels')
        .delete()
        .eq('id', level.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-levels'] });
      toast({
        title: "Sucesso",
        description: "Nível de acesso excluído com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir nível de acesso",
        variant: "destructive",
      });
    },
  });

  return {
    accessLevels,
    isLoading,
    error,
    refetch,
    createAccessLevel: createAccessLevel.mutate,
    updateAccessLevel: updateAccessLevel.mutate,
    deleteAccessLevel: deleteAccessLevel.mutate,
    isCreating: createAccessLevel.isPending,
    isUpdating: updateAccessLevel.isPending,
    isDeleting: deleteAccessLevel.isPending,
  };
}