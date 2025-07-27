
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface RollbackParams {
  versionId: string;
  reason: string;
  targetEnvironment: 'production' | 'staging' | 'preview';
  rollbackType: 'manual' | 'automatic';
  rollbackBy: string;
}

export const useRollback = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermissions();

  const rollbackMutation = useMutation({
    mutationFn: async (params: RollbackParams) => {
      const { data, error } = await supabase.functions.invoke('rollback-version', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Rollback realizado',
        description: 'A versão foi revertida com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['app-versions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no rollback',
        description: error.message || 'Falha ao reverter versão',
        variant: 'destructive',
      });
    }
  });

  const rollbackToVersion = async (versionId: string): Promise<boolean> => {
    try {
      await rollbackMutation.mutateAsync({
        versionId,
        reason: 'Manual rollback',
        targetEnvironment: 'production',
        rollbackType: 'manual',
        rollbackBy: 'admin'
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    rollbackToVersion,
    isRollingBack: rollbackMutation.isPending,
    mutateAsync: rollbackMutation.mutateAsync
  };
};

export const useCanRollback = () => {
  const { isSuperAdmin } = usePermissions();

  return {
    canRollbackProduction: isSuperAdmin,
    canRollbackStaging: isSuperAdmin,
    canRollbackPreview: true
  };
};
